import React, { Fragment, useState } from 'react';
import {
  Card as MuiCard,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CardProps {
  title: string;
  description: string;
  image: string;
  link?: string;
  type?: string;
}

const Card: React.FC<CardProps> = ({ title, description, image, link, type }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (type === 'page' && link) {
      window.location.href = link;
    } else {
      setIsOpen(true);
    }
  };

  const getGoogleDriveUrl = (url: string) => {
    if (!url) return '';
    const match = url.match(/d\/(.*?)(\/|$)/);
    return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
  };

  return (
    <Fragment>
      <MuiCard
        onClick={handleClick}
        sx={{
          width: 280,
          cursor: 'pointer',
          transition: 'transform 0.3s',
          boxShadow: 3,
          borderRadius: 2,
          '&:hover': { transform: 'scale(1.05)' },
        }}
      >
        <CardMedia component="img" height="160" image={image} alt={title} />
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="primary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          {type === 'page' && link && (
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              href={link}
              onClick={(e) => e.stopPropagation()}
            >
              Saiba Mais
            </Button>
          )}
        </CardContent>
      </MuiCard>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="lg" fullWidth scroll="body">
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {title}
          <IconButton
            aria-label="close"
            onClick={() => setIsOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ minHeight: '400px' }}>
          {type === 'image' && (
            <Box
              component="img"
              src={getGoogleDriveUrl(link || '')}
              alt={title}
              sx={{ width: '100%', borderRadius: 2 }}
            />
          )}
          {type === 'doc' && (
            <iframe
              src={`https://drive.google.com/file/d/${link?.split('/d/')[1]?.split('/')[0]}/preview`}
              width="100%"
              height="600px"
              style={{ border: 'none' }}
              title={title}
            />
          )}
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default Card;
