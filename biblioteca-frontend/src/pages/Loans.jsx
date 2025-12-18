import { useState, useEffect } from 'react';
import { 
    Box, Button, Typography, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, IconButton, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    MenuItem, TextField, Chip 
} from '@mui/material';
import { Add, AssignmentReturn, CheckCircle } from '@mui/icons-material';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [socios, setSocios] = useState([]);
    const [ejemplares, setEjemplares] = useState([]); // Solo los disponibles
    
    const [open, setOpen] = useState(false);
    
    // Formulario simple: Solo necesitamos elegir quién y qué
    const [formData, setFormData] = useState({
        socioId: '',
        ejemplarId: ''
    });

    // 1. CARGAR DATOS (Préstamos, Socios y Copias)
    const fetchData = async () => {
        try {
            // Hacemos 3 peticiones en paralelo para ser rápidos
            const [loansRes, sociosRes, copiesRes] = await Promise.all([
                api.get('/loans'),   // Historial de préstamos
                api.get('/members'), // Lista de socios para el combo
                api.get('/copies')   // Lista de copias para el combo
            ]);

            setLoans(loansRes.data);
            setSocios(sociosRes.data);
            
            // Filtramos: Solo mostramos en el combo los libros que están "Disponibles"
            const disponibles = copiesRes.data.filter(c => c.estado === 'Disponible');
            setEjemplares(disponibles);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. ABRIR MODAL
    const handleOpen = () => {
        setFormData({ socioId: '', ejemplarId: '' });
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    // 3. CREAR PRÉSTAMO
    const handleCreate = async () => {
        try {
            const inquilinoId = parseInt(localStorage.getItem('inquilinoId'));
            
            await api.post('/loans', {
                inquilinoId,
                socioId: formData.socioId,
                ejemplarId: formData.ejemplarId
            });

            Swal.fire('Éxito', 'Préstamo registrado correctamente', 'success');
            setOpen(false);
            fetchData(); // Recargar todo para actualizar la lista de disponibles
        } catch (error) {
            Swal.fire('Error', error.response?.data || 'No se pudo crear el préstamo', 'error');
        }
    };

    // 4. DEVOLVER LIBRO
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
                    // Enviamos solo el ID (int) como pide el Backend
                    await api.post('/loans/return', prestamoId, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    Swal.fire('Devuelto', 'El libro ha sido devuelto.', 'success');
                    fetchData();
                } catch (error) {
                    Swal.fire('Error', 'No se pudo procesar la devolución', 'error');
                }
            }
        });
    };

    // Función auxiliar para formatear fechas bonitas
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Control de Préstamos</Typography>
                <Button 
                    variant="contained" 
                    color="warning" // Color naranja para diferenciar
                    startIcon={<Add />} 
                    onClick={handleOpen}
                >
                    Nuevo Préstamo
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: '#fff3e0' }}> {/* Un fondo suave naranja */}
                        <TableRow>
                            <TableCell fontWeight="bold">Libro</TableCell>
                            <TableCell>Socio</TableCell>
                            <TableCell>Fecha Préstamo</TableCell>
                            <TableCell>Vencimiento</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="center">Acción</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loans.map((loan) => (
                            <TableRow key={loan.prestamoId} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    {loan.ejemplar?.libro?.titulo || 'Libro desconocido'}
                                    <br/>
                                    <Typography variant="caption" color="text.secondary">
                                        {loan.ejemplar?.codigoBarras}
                                    </Typography>
                                </TableCell>
                                <TableCell>{loan.socio?.nombreCompleto}</TableCell>
                                <TableCell>{formatDate(loan.fechaPrestamo)}</TableCell>
                                <TableCell sx={{ 
                                    color: new Date(loan.fechaVencimiento) < new Date() && loan.estado === 'Activo' ? 'red' : 'inherit',
                                    fontWeight: new Date(loan.fechaVencimiento) < new Date() && loan.estado === 'Activo' ? 'bold' : 'normal'
                                }}>
                                    {formatDate(loan.fechaVencimiento)}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={loan.estado} 
                                        color={loan.estado === 'Activo' ? 'warning' : 'success'} 
                                        size="small" 
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    {loan.estado === 'Activo' && (
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            color="success"
                                            startIcon={<AssignmentReturn />}
                                            onClick={() => handleReturn(loan.prestamoId)}
                                        >
                                            Devolver
                                        </Button>
                                    )}
                                    {loan.estado === 'Devuelto' && (
                                        <CheckCircle color="success" />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* MODAL NUEVO PRÉSTAMO */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Registrar Préstamo</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Selecciona el socio y el libro físico que se va a llevar.
                    </Typography>
                    
                    {/* SELECTOR DE SOCIO */}
                    <TextField
                        select margin="dense" label="Socio" fullWidth
                        value={formData.socioId}
                        onChange={(e) => setFormData({...formData, socioId: e.target.value})}
                    >
                        {socios.map((socio) => (
                            <MenuItem key={socio.socioId} value={socio.socioId}>
                                {socio.nombreCompleto} ({socio.codigo})
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* SELECTOR DE EJEMPLAR */}
                    <TextField
                        select margin="dense" label="Libro (Copia Disponible)" fullWidth
                        value={formData.ejemplarId}
                        onChange={(e) => setFormData({...formData, ejemplarId: e.target.value})}
                        helperText={ejemplares.length === 0 ? "No hay libros disponibles en estante" : ""}
                    >
                        {ejemplares.map((copy) => (
                            <MenuItem key={copy.ejemplarId} value={copy.ejemplarId}>
                                {copy.libro?.titulo} - (Cód: {copy.codigoBarras})
                            </MenuItem>
                        ))}
                    </TextField>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancelar</Button>
                    <Button 
                        onClick={handleCreate} 
                        variant="contained" 
                        color="warning"
                        disabled={!formData.socioId || !formData.ejemplarId}
                    >
                        Prestar Libro
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Loans;