import { useEffect, useMemo, useState, useCallback } from 'react';
import * as anchor from '@project-serum/anchor';

import styled from 'styled-components';
import { Container, Snackbar } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDialogButton } from '@solana/wallet-adapter-material-ui';
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken
} from './candy-machine';
import { AlertState } from './utils';
import { Header } from './Header';
import { GatewayProvider } from '@civic/solana-gateway-react';
import { CrossmintPayButton } from '@crossmint/client-sdk-react-ui';
import { WhaButton } from './WhatsappButton';
import { Descubrenos } from './Descubrenos';
const ConnectButton = styled(WalletDialogButton)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, #813eee 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const MintContainer = styled.div``; // add your owns styles here

export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined
  });

  const rpcUrl = props.rpcHost;
  const wallet = useWallet();

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection
        );
        setCandyMachine(cndy);
      } catch (e) {
        console.log(
          'Hubo un problema solicitando el estado de la Maquina de Caramelos'
        );
        console.log(e);
      }
    }
  }, [anchorWallet, props.candyMachineId, props.connection]);

  const onMint = async () => {
    try {
      setIsUserMinting(true);
      document.getElementById('#identity')?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = (
          await mintOneToken(candyMachine, wallet.publicKey)
        )[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            props.txTimeout,
            props.connection,
            true
          );
        }

        if (status && !status.err) {
          setAlertState({
            open: true,
            message: 'Felicidades! Compra exitosa!',
            severity: 'success'
          });
        } else {
          setAlertState({
            open: true,
            message: 'Transacción Fallida! Por favor intentalo Nuevamente!',
            severity: 'error'
          });
        }
      }
    } catch (error: any) {
      let message = error.msg || '¡Fallo en la compra, intentalo Nuevamente!';
      if (!error.msg) {
        if (!error.message) {
          message =
            'Tiempo de espera terminado, Por favor intentelo Nuevamente.';
        } else if (error.message.indexOf('0x137') !== -1) {
          message = `AGOTADO!`;
        } else if (error.message.indexOf('0x135') !== -1) {
          message = `Fondos Insuficientes. Por favor recargue su billetera.`;
        }
      } else {
        if (error.code === 311) {
          message = `AGOTADO!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `El proceso de compra no ha empezado.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: 'error'
      });
    } finally {
      setIsUserMinting(false);
    }
  };

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    refreshCandyMachineState
  ]);

  return (
    <Container>
      <Descubrenos />
      <Container maxWidth="xs" style={{ position: 'relative' }}>
        <Paper
          style={{
            padding: 24,
            backgroundColor: '#151A1F',
            borderRadius: 6
          }}
        >
          {!wallet.connected ? (
            <ConnectButton>CONECTAR BILLETERA</ConnectButton>
          ) : (
            <>
              <Header candyMachine={candyMachine} />
              <MintContainer>
                {candyMachine?.state.isActive &&
                candyMachine?.state.gatekeeper &&
                wallet.publicKey &&
                wallet.signTransaction ? (
                  <GatewayProvider
                    wallet={{
                      publicKey:
                        wallet.publicKey ||
                        new PublicKey(CANDY_MACHINE_PROGRAM),
                      //@ts-ignore
                      signTransaction: wallet.signTransaction
                    }}
                    gatekeeperNetwork={
                      candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                    }
                    clusterUrl={rpcUrl}
                    options={{ autoShowModal: false }}
                  >
                    <WhaButton />
                  </GatewayProvider>
                ) : (
                  <div></div>
                )}
              </MintContainer>
            </>
          )}
          {process.env.REACT_APP_CROSSMINT_ID && (
            <CrossmintPayButton
              style={{ margin: '0 auto', width: '100%' }}
              clientId={process.env.REACT_APP_CROSSMINT_ID}
              environment={
                process.env.REACT_APP_SOLANA_NETWORK === 'devnet' &&
                process.env.REACT_APP_SOLANA_RPC_HOST ===
                  'https://api.devnet.solana.com'
                  ? 'staging'
                  : ''
              }
            />
          )}
        </Paper>
      </Container>
      

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Home;
