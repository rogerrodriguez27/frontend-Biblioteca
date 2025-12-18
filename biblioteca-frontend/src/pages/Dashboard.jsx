import { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { 
    MenuBook as BookIcon, 
    People as PeopleIcon, 
    Warning as WarningIcon, 
    CheckCircle as ActiveIcon 
} from '@mui/icons-material';
import api from '../api/axiosConfig';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Recuperamos el ID del inquilino guardado al login
                const inquilinoId = localStorage.getItem('inquilinoId');
                
                // Llamamos a TU Backend
                const response = await api.get(`/reports/dashboard?inquilinoId=${inquilinoId}`);
                setStats(response.data);
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Panel de Control
            </Typography>

            <Grid container spacing={3}>
                
                {/* TARJETA 1: TOTAL LIBROS */}
                <StatCard 
                    title="Total Libros" 
                    value={stats?.totalLibros || 0} 
                    icon={<BookIcon fontSize="large" sx={{ color: 'white' }} />} 
                    color="#1976d2" // Azul
                />

                {/* TARJETA 2: SOCIOS */}
                <StatCard 
                    title="Socios Activos" 
                    value={stats?.totalSocios || 0} 
                    icon={<PeopleIcon fontSize="large" sx={{ color: 'white' }} />} 
                    color="#2e7d32" // Verde
                />

                {/* TARJETA 3: PRÉSTAMOS ACTIVOS */}
                <StatCard 
                    title="Préstamos Activos" 
                    value={stats?.prestamosActivos || 0} 
                    icon={<ActiveIcon fontSize="large" sx={{ color: 'white' }} />} 
                    color="#ed6c02" // Naranja
                />

                {/* TARJETA 4: VENCIDOS */}
                <StatCard 
                    title="Vencidos" 
                    value={stats?.prestamosVencidos || 0} 
                    icon={<WarningIcon fontSize="large" sx={{ color: 'white' }} />} 
                    color="#d32f2f" // Rojo
                />
            </Grid>
        </div>
    );
};

// Componente pequeño para las tarjetas (Cards)
const StatCard = ({ title, value, icon, color }) => (
    <Grid item xs={12} sm={6} md={3}>
        <Paper 
            elevation={3} 
            sx={{ 
                p: 2, display: 'flex', alignItems: 'center', 
                borderRadius: 2, overflow: 'hidden', position: 'relative' 
            }}
        >
            <Box sx={{ 
                bgcolor: color, 
                p: 2, borderRadius: 2, display: 'flex', 
                boxShadow: 2, mr: 2 
            }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                    {value}
                </Typography>
            </Box>
        </Paper>
    </Grid>
);

export default Dashboard;