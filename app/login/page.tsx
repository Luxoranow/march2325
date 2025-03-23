import SignInForm from '@/components/auth/SignInForm';
import { Box, Container } from '@mui/material';

export default function LoginPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <SignInForm />
      </Box>
    </Container>
  );
} 