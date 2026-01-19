import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmailVerificationInstructions.css';

const EmailVerificationInstructions: React.FC = () => {
  const navigate = useNavigate();
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <div className="email-verification-fullscreen-bg">
      <div className="email-verification-instructions-container">
        <div className="email-verification-header">
          <h1>Verifique seu e-mail</h1>
          <p>
            Para ativar sua conta, siga os passos abaixo:
          </p>
          <ol>
            <li>Acesse seu e-mail pessoal (verifique também a caixa de spam).</li>
            <li>Procure por um e-mail com o título <b>"Amazon Web Services – Email Address Verification Request"</b>.</li>
            <li>Abra o e-mail e clique no link destacado conforme a imagem abaixo:</li>
          </ol>
        </div>
        <div className="email-verification-image-wrapper">
          <img
            src="https://orfanatos-nib-storage.s3.us-east-1.amazonaws.com/aux/2026-01-04_11-11.png"
            alt="Exemplo de e-mail de verificação AWS"
            className="email-verification-image"
            onClick={() => setShowImageModal(true)}
            style={{ cursor: 'zoom-in' }}
          />
          <span className="expand-hint">Toque para ampliar</span>
        </div>
        <p className="final-msg">
          Após clicar no link, sua conta estará pronta para uso!
        </p>
        <button className="back-btn" onClick={() => navigate('/meu-perfil')}>
          Voltar
        </button>
      </div>

      {showImageModal && (
        <div className="email-verification-modal" onClick={() => setShowImageModal(false)}>
          <img
            src="https://orfanatos-nib-storage.s3.us-east-1.amazonaws.com/aux/2026-01-04_11-11.png"
            alt="Exemplo de e-mail de verificação AWS"
            className="email-verification-image-modal"
          />
          <button className="close-modal-btn" onClick={() => setShowImageModal(false)}>
            Fechar
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailVerificationInstructions;
