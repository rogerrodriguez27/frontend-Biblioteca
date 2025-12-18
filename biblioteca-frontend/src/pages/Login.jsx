import { useState } from 'react';
import { 
    Container, Paper, TextField, Button, Typography, Box, InputAdornment 
} from '@mui/material';
import { 
    Login as LoginIcon, 
    Business as BusinessIcon, 
    Email as EmailIcon, 
    Lock as LockIcon 
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig'; // Importamos nuestra conexión configurada
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        codigoTenant: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Hacemos la petición al Backend
            const response = await api.post('/auth/login', formData);
            
            // Si llegamos aquí, el login fue exitoso
            const { token, usuario, rol, inquilinoId } = response.data;

            // 1. Guardamos los datos en la "Caja Fuerte" del navegador
            localStorage.setItem('token', token);
            localStorage.setItem('usuario', usuario);
            localStorage.setItem('rol', rol);
            localStorage.setItem('inquilinoId', inquilinoId);

            // 2. Alerta de éxito bonita
            Swal.fire({
                icon: 'success',
                title: `¡Bienvenido, ${usuario}!`,
                text: 'Iniciando sesión...',
                timer: 1500,
                showConfirmButton: false
            });

            // 3. Redirigir al Dashboard (lo crearemos en el siguiente paso)
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            console.error(error);
            // Mensaje de error si falla
            Swal.fire({
                icon: 'error',
                title: 'Error de acceso',
                text: error.response?.data || 'No se pudo conectar con el servidor'
            });
        }
    };

    return (
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f0f2f5' // Fondo gris suave
        }}>
            <Container maxWidth="xs">
                <Paper elevation={10} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                    
                    {/* LOGO O ÍCONO */}
                    <Box sx={{ 
                        width: 60, height: 60, 
                        bgcolor: 'primary.main', 
                        borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto', mb: 2
                    }}>
                        <LoginIcon sx={{ color: 'white', fontSize: 30 }} />
                    </Box>

                    <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                        Acceso a Biblioteca
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        {/* CAMPO: CÓDIGO DE BIBLIOTECA */}
                        <TextField
                            fullWidth margin="normal" label="Cód. Biblioteca (Tenant)"
                            name="codigoTenant"
                            value={formData.codigoTenant} onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BusinessIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* CAMPO: EMAIL */}
                        <TextField
                            fullWidth margin="normal" label="Correo Electrónico"
                            name="email" type="email"
                            value={formData.email} onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* CAMPO: CONTRASEÑA */}
                        <TextField
                            fullWidth margin="normal" label="Contraseña"
                            name="password" type="password"
                            value={formData.password} onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button 
                            type="submit" fullWidth variant="contained" size="large"
                            sx={{ mt: 3, mb: 2, borderRadius: 2, py: 1.5 }}
                        >
                            INGRESAR
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;