import SignUpForm from '@/components/auth/SignUpForm';
import { Box, Container } from '@mui/material';

export default function SignUpPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <SignUpForm />
      </Box>
    </Container>
  );
} 