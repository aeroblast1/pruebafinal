import { Button, ButtonProps, styled } from '@material-ui/core';
import { deepPurple } from '@material-ui/core/colors';

const ColorButton = styled(Button)<ButtonProps>(() => ({
  backgroundColor: deepPurple[500],
  '&:hover': {
    backgroundColor: deepPurple[700]
  }
}));

const initialUrl = 'https://marcelorm99.wixsite.com/my-site/mecado-de-reventa';

export function Descubrenos() {
  const textStyles = {
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px'
  };

  return (
    <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
      <a
        style={{ textDecoration: 'none' }}
        href={`${initialUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        <ColorButton variant="contained" color="primary">
          <span style={textStyles}> Descubre Blicket </span>
        </ColorButton>
      </a>
    </div>
  );
}
