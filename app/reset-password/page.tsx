import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Box, Container } from '@mui/material';

export default function ResetPasswordPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <ResetPasswordForm />
      </Box>
    </Container>
  );
} 