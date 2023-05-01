import { styled } from '@material-ui/core';
import Button, { ButtonProps } from '@material-ui/core/Button/Button';
import { green } from '@material-ui/core/colors';

const ColorButton = styled(Button)<ButtonProps>(() => ({
  backgroundColor: green[500],
  '&:hover': {
    backgroundColor: green[700]
  }
}));

const phoneNumber = '51918677883';

export function WhaButton() {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center'
  };
  const textStyles = {
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px'
  };

  return (
    <div style={containerStyle}>
      <a
        style={{ textDecoration: 'none', marginTop: '10px' }}
        href={`https://wa.me/${phoneNumber}`}
        target="_blank"
        rel="noreferrer"
      >
        <ColorButton variant="contained" color="primary">
          <span style={textStyles}>Comprar en Whatsapp</span>
        </ColorButton>
      </a>
    </div>
  );
}
