import { useEffect, useState } from 'react';
import { 
    Grid, Paper, Typography, Box, CircularProgress, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
    CardActionArea 
} from '@mui/material';
import { 
    MenuBook as BookIcon, 
    People as PeopleIcon, 
    Warning as WarningIcon, 
    CheckCircle as ActiveIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Para navegar
import api from '../api/axiosConfig';

const Dashboard = () => {
    const navigate = useNavigate(); // Hook de navegación
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/reports/dashboard');
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
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Panel de Control
            </Typography>

            {/* SECCIÓN 1: TARJETAS CON NAVEGACIÓN */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                
                {/* TARJETA 1: LIBROS -> Ir a /books */}
                <StatCard 
                    title="Total Libros" 
                    value={stats?.totalLibros || 0} 
                    icon={<BookIcon fontSize="large" sx={{ color: 'white' }} />} 
                    color="#1976d2"
                    onClick={() => navigate('/books')} // <--- Acción de clic
                />

                {/* TARJETA 2: SOCIOS -> Ir a /members */}
                <StatCard 
                    title="Socios Activos" 
                    value={stats?.totalSocios || 0} 
                    icon={<PeopleIcon fontSize="large" sx={{ color: 'white' }} />} 
                    color="#2e7d32"
                    onClick={() => navigate('/members')}
                />

                {/* TARJETA 3: PRÉSTAMOS -> Ir a /loans */}
                <StatCard 
                    title="Préstamos Activos" 
                    value={stats?.prestamosActivos || 0} 
                    icon={<ActiveIcon fontSize="large" sx={{ color: 'white' }} />} 
                    color="#ed6c02"
                    onClick={() => navigate('/loans')}
                />

                {/* TARJETA 4: VENCIDOS -> Ir a /loans */}
                <StatCard 
                    title="Vencidos" 
                    value={stats?.prestamosVencidos || 0} 
                    icon={<WarningIcon fontSize="large" sx={{ color: 'white' }} />} 
                    color="#d32f2f"
                    onClick={() => navigate('/loans')}
                />
            </Grid>

            {/* SECCIÓN 2: ACTIVIDAD RECIENTE (NUEVO) */}
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon color="action" /> Actividad Reciente (Últimos movimientos)
            </Typography>

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Libro Prestado</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Socio</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stats?.ultimosPrestamos?.length > 0 ? (
                            stats.ultimosPrestamos.map((p) => (
                                <TableRow key={p.prestamoId} hover>
                                    <TableCell>{p.libro || 'Libro desconocido'}</TableCell>
                                    <TableCell>{p.socio}</TableCell>
                                    <TableCell>{p.fecha}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={p.estado} 
                                            size="small" 
                                            color={p.estado === 'Activo' ? 'warning' : 'success'} 
                                            variant="outlined"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    No hay actividad reciente registrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

// COMPONENTE TARJETA MEJORADO (CLICABLE)
const StatCard = ({ title, value, icon, color, onClick }) => (
    <Grid item xs={12} sm={6} md={3}>
        <Paper 
            elevation={3} 
            sx={{ 
                borderRadius: 2, overflow: 'hidden', position: 'relative',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)', cursor: 'pointer' } // Efecto Hover
            }}
        >
            <CardActionArea onClick={onClick} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
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
            </CardActionArea>
        </Paper>
    </Grid>
);

export default Dashboard;