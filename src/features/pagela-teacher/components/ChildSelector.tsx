import * as React from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import { ChildSimpleResponseDto } from '@/features/children/types';

type Props = {
  loading: boolean;
  items: ChildSimpleResponseDto[];
  value: ChildSimpleResponseDto | null;
  onChange: (child: ChildSimpleResponseDto | null) => void;
  onSearch: (q: string) => void;
};

export default function ChildSelector({ loading, items, value, onChange, onSearch }: Props) {
  return (
    <Autocomplete
      fullWidth
      options={items}
      value={value}
      loading={loading}
      onChange={(_, v) => onChange(v)}
      onInputChange={(_, q) => onSearch(q)}
      getOptionLabel={(o) => o.name}
      ListboxProps={{ style: { maxHeight: 320 } }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Selecionar criança"
          size="small"
          placeholder="Nome ou tel. do responsável…"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <ListItem
          {...props}
          key={option.id}
          secondaryAction={
            option.guardianPhone ? <Chip size="small" label={option.guardianPhone} /> : null
          }
        >
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'success.main', color: '#fff' }}>
              {option.name?.charAt(0)?.toUpperCase() || 'C'}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography fontWeight={700} noWrap>
                {option.name}
              </Typography>
            }
            secondary={
              <Box component="span">
                <Typography component="span" variant="body2" color="text.secondary" noWrap>
                  Resp.: {option.guardianName || '—'}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      )}
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
    />
  );
}
