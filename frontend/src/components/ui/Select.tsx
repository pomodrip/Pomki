import React from 'react';
import { MenuItem, Select as MuiSelect, SelectProps, FormControl, InputLabel, styled } from '@mui/material';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 120,
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[0],
}));

const StyledSelect = styled(MuiSelect)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: 400,
  background: theme.palette.background.paper,
  '& .MuiSelect-select': {
    padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
  },
  '& fieldset': {
    borderColor: theme.palette.grey[300],
    borderRadius: theme.shape.borderRadius,
  },
  '&:hover fieldset': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused fieldset': {
    borderColor: theme.palette.primary.main,
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  color: theme.palette.text.primary,
  '&.Mui-selected': {
    background: theme.palette.primary.light,
    color: theme.palette.primary.main,
  },
}));

const Select: React.FC<SelectProps> = (props) => (
  <StyledFormControl size="small" fullWidth>
    {/* label은 props로 넘길 수 있음 */}
    {props.label && <InputLabel>{props.label}</InputLabel>}
    <StyledSelect {...props}>{props.children}</StyledSelect>
  </StyledFormControl>
);

export { StyledMenuItem as SelectMenuItem };
export default Select; 