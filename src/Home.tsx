import { useEffect, useMemo, useState, useCallback } from 'react';
import * as anchor from '@project-serum/anchor';


import { Container, Snackbar } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';

import { useWallet } from '@solana/wallet-adapter-react';

import {
  CandyMachineAccount,
  getCandyMachineState
} from './candy-machine';
import { AlertState } from './utils';


import { CrossmintPayButton } from '@crossmint/client-sdk-react-ui';
import { WhaButton } from './WhatsappButton';
import { Descubrenos } from './Descubrenos';



export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined
  });


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
                <WhaButton />
                {candyMachine && <div></div>}
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
