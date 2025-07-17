import React, { useState, useEffect } from 'react'; 
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Box,
  Typography
} from '@mui/material';
import CircularProgress from '../ui/CircularProgress';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  fetchDecks,
  createDeck,
  selectFilteredDecks,
  selectDeckLoading,
  selectDeckError,
} from '../../store/slices/deckSlice';
import type { CardDeck, CreateDeckRequest } from '../../types/card';

interface DeckSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onDeckSelected: (deck: CardDeck) => void;
}

const DeckSelectionDialog: React.FC<DeckSelectionDialogProps> = ({
  open,
  onClose,
  onDeckSelected,
}) => {
  const dispatch = useAppDispatch();
  const decks = useAppSelector(selectFilteredDecks);
  const loading = useAppSelector(selectDeckLoading);
  const error = useAppSelector(selectDeckError);

  const [newDeckName, setNewDeckName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchDecks());
    }
  }, [open, dispatch]);

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) {
      return;
    }
    setIsCreating(true);
    try {
      const newDeck = await dispatch(
        createDeck({ deckName: newDeckName })
      ).unwrap();
      onDeckSelected(newDeck as CardDeck);
      setNewDeckName('');
      onClose();
    } catch (err) {
      console.error('Failed to create deck:', err);
      // You might want to show an error to the user here
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeckClick = (deck: CardDeck) => {
    onDeckSelected(deck);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>덱 선택 또는 생성</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>
          기존 덱에서 선택
        </Typography>
        {loading && <CircularProgress />}
        {error && <Typography color="error">덱을 불러오는 데 실패했습니다: {error}</Typography>}
        <List sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
          {decks.map((deck: CardDeck) => (
            <ListItem
              button
              key={deck.deckId}
              onClick={() => handleDeckClick(deck)}
              sx={{
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  backgroundColor: 'transparent',
                  border: '2px solid #1976d2', // primary color highlight
                  borderRadius: '8px',
                  '& .MuiListItemText-primary': {
                    fontSize: '1.1em',
                  },
                  '& .MuiListItemText-secondary': {
                    fontSize: '1.1em',
                  },
                },
              }}
            >
              <ListItemText
                primary={deck.deckName}
                secondary={`카드 수: ${deck.cardCnt}`}
              />
            </ListItem>
          ))}
        </List>

        <Box component="div" sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              새 덱 생성
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="새 덱 이름"
              type="text"
              fullWidth
              variant="outlined"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              disabled={isCreating}
            />
            <Button
              onClick={handleCreateDeck}
              variant="contained"
              disabled={isCreating || !newDeckName.trim()}
              sx={{ mt: 1 }}
            >
              {isCreating ? <CircularProgress size={24} /> : '생성하고 선택'}
            </Button>
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeckSelectionDialog; 