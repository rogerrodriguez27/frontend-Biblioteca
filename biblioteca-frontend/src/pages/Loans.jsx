import { useState, useEffect } from 'react';
import { 
    Box, Button, Typography, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, IconButton, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    MenuItem, TextField, Chip 
} from '@mui/material';
import { Add, AssignmentReturn, CheckCircle, CalendarMonth } from '@mui/icons-material';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [socios, setSocios] = useState([]);
    const [ejemplares, setEjemplares] = useState([]);
    const [open, setOpen] = useState(false);
    
    // FUNCIONES PARA FECHAS POR DEFECTO
    const getToday = () => new Date().toISOString().split('T')[0];
    const getNextWeek = () => {
        const d = new Date();
        d.setDate(d.getDate() + 7); // Sumar 7 días
        return d.toISOString().split('T')[0];
    };

    // FORMULARIO CON FECHAS
    const [formData, setFormData] = useState({
        socioId: '',
        ejemplarId: '',
        fechaPrestamo: getToday(),
        fechaVencimiento: getNextWeek()
    });

    const fetchData = async () => {
        try {
            const [loansRes, sociosRes, copiesRes] = await Promise.all([
                api.get('/loans'),
                api.get('/members'),
                api.get('/copies')
            ]);
            setLoans(loansRes.data);
            setSocios(sociosRes.data);
            // Filtramos solo disponibles
            setEjemplares(copiesRes.data.filter(c => c.estado === 'Disponible'));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpen = () => {
        // Al abrir, reseteamos a fechas actuales
        setFormData({ 
            socioId: '', 
            ejemplarId: '',
            fechaPrestamo: getToday(),
            fechaVencimiento: getNextWeek()
        });
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleCreate = async () => {
        try {
            const inquilinoId = parseInt(localStorage.getItem('inquilinoId'));
            
            await api.post('/loans', {
                inquilinoId,
                socioId: formData.socioId,
                ejemplarId: formData.ejemplarId,
                fechaPrestamo: formData.fechaPrestamo,       // <--- ENVIAMOS FECHA
                fechaVencimiento: formData.fechaVencimiento  // <--- ENVIAMOS VENCIMIENTO
            });

            Swal.fire('Éxito', 'Préstamo registrado correctamente', 'success');
            setOpen(false);
            fetchData(); 
        } catch (error) {
            Swal.fire('Error', error.response?.data || 'No se pudo crear', 'error');
        }
    };

    const handleReturn = async (prestamoId) => {
        Swal.fire({
            title: '¿Confirmar devolución?',
            text: "El libro volverá a estar disponible.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, devolver',
            confirmButtonColor: '#2e7d32'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.post('/loans/return', prestamoId, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    Swal.fire('Devuelto', 'Libro devuelto con éxito.', 'success');
                    fetchData();
                } catch (error) {
                    Swal.fire('Error', 'No se pudo procesar', 'error');
                }
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Control de Préstamos</Typography>
                <Button variant="contained" color="warning" startIcon={<Add />} onClick={handleOpen}>
                    Nuevo Préstamo
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: '#fff3e0' }}>
                        <TableRow>
                            <TableCell fontWeight="bold">Libro</TableCell>
                            <TableCell>Socio</TableCell>
                            <TableCell>Encargado</TableCell> {/* <--- NUEVA COLUMNA */}
                            <TableCell>Inicio</TableCell>
                            <TableCell>Vencimiento</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="center">Acción</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loans.map((loan) => (
                            <TableRow key={loan.prestamoId} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    {loan.ejemplar?.libro?.titulo || loan.ejemplar?.Libro?.titulo || 'Desconocido'}
                                    <br/>
                                    <Typography variant="caption" color="text.secondary">
                                        {loan.ejemplar?.codigoBarras}
                                    </Typography>
                                </TableCell>
                                <TableCell>{loan.socio?.nombreCompleto}</TableCell>
                                
                                {/* NUEVA CELDA: MOSTRAR QUIÉN LO PRESTÓ */}
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                                        {loan.usuario?.nombreCompleto || 'Sistema'}
                                    </Typography>
                                </TableCell>

                                <TableCell>{formatDate(loan.fechaPrestamo)}</TableCell>
                                <TableCell sx={{ 
                                    color: new Date(loan.fechaVencimiento) < new Date() && loan.estado === 'Activo' ? 'red' : 'inherit',
                                    fontWeight: new Date(loan.fechaVencimiento) < new Date() && loan.estado === 'Activo' ? 'bold' : 'normal'
                                }}>
                                    {formatDate(loan.fechaVencimiento)}
                                </TableCell>
                                <TableCell>
                                    <Chip label={loan.estado} color={loan.estado === 'Activo' ? 'warning' : 'success'} size="small" />
                                </TableCell>
                                <TableCell align="center">
                                    {loan.estado === 'Activo' ? (
                                        <Button variant="outlined" size="small" color="success" startIcon={<AssignmentReturn />} onClick={() => handleReturn(loan.prestamoId)}>
                                            Devolver
                                        </Button>
                                    ) : (
                                        <CheckCircle color="success" />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* MODAL MEJORADO CON FECHAS */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonth color="primary"/> Registrar Préstamo
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, mt: 1, color: 'text.secondary' }}>
                        Configure quién se lleva el libro y cuándo debe devolverlo.
                    </Typography>
                    
                    <TextField
                        select margin="dense" label="Socio" fullWidth
                        value={formData.socioId}
                        onChange={(e) => setFormData({...formData, socioId: e.target.value})}
                    >
                        {socios.map((s) => (
                            <MenuItem key={s.socioId} value={s.socioId}>{s.nombreCompleto} ({s.codigo})</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select margin="dense" label="Libro Disponible" fullWidth
                        value={formData.ejemplarId}
                        onChange={(e) => setFormData({...formData, ejemplarId: e.target.value})}
                    >
                        {ejemplares.map((c) => (
                            <MenuItem key={c.ejemplarId} value={c.ejemplarId}>
                                {c.libro?.titulo || c.Libro?.titulo} - {c.codigoBarras}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* NUEVOS CAMPOS DE FECHA */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                            label="Fecha de Préstamo"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={formData.fechaPrestamo}
                            onChange={(e) => setFormData({...formData, fechaPrestamo: e.target.value})}
                        />
                        <TextField
                            label="Fecha de Vencimiento"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={formData.fechaVencimiento}
                            onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
                        />
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancelar</Button>
                    <Button 
                        onClick={handleCreate} 
                        variant="contained" 
                        color="warning"
                        disabled={!formData.socioId || !formData.ejemplarId}
                    >
                        Registrar Préstamo
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Loans;