import { useState, useEffect } from 'react';
import { 
    Box, Button, Typography, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, IconButton, 
    Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    MenuItem, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';

const Members = () => {
    // --- ESTADOS ---
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // <--- NUEVO ESTADO DE BÚSQUEDA

    // Estados del Modal
    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    const [formData, setFormData] = useState({
        socioId: 0,
        codigo: '',
        nombreCompleto: '',
        email: '',
        tipoSocio: 'Estudiante'
    });

    // 1. CARGAR SOCIOS
    const fetchMembers = async () => {
        try {
            const response = await api.get('/members');
            setMembers(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // ==========================================
    // LÓGICA DE FILTRADO (BÚSQUEDA)
    // ==========================================
    const filteredMembers = members.filter((member) => {
        const searchLower = searchTerm.toLowerCase();
        
        // Buscamos por Nombre, Código (DNI) o Email
        return (
            member.nombreCompleto.toLowerCase().includes(searchLower) ||
            member.codigo.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower)
        );
    });

    // ==========================================
    // LÓGICA CRUD
    // ==========================================
    const handleOpen = (member = null) => {
        if (member) {
            setIsEdit(true);
            setFormData(member);
        } else {
            setIsEdit(false);
            setFormData({
                socioId: 0, codigo: '', nombreCompleto: '', 
                email: '', tipoSocio: 'Estudiante'
            });
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSave = async () => {
        try {
            const inquilinoId = parseInt(localStorage.getItem('inquilinoId'));
            const payload = { ...formData, inquilinoId };

            if (isEdit) {
                await api.put(`/members/${formData.socioId}`, payload);
                Swal.fire('Actualizado', 'Socio actualizado correctamente', 'success');
            } else {
                await api.post('/members', payload);
                Swal.fire('Registrado', 'Nuevo socio registrado', 'success');
            }
            
            setOpen(false);
            fetchMembers();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.response?.data || 'No se pudo guardar', 'error');
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Eliminar socio?',
            text: "Si tiene historial de préstamos, no se podrá borrar.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/members/${id}`);
                    Swal.fire('Eliminado', 'El socio ha sido eliminado.', 'success');
                    fetchMembers();
                } catch (error) {
                    Swal.fire('Error', 'No se puede eliminar (probablemente tiene historial).', 'error');
                }
            }
        });
    };

    return (
        <Box>
            {/* ENCABEZADO CON BUSCADOR */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Gestión de Socios</Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Buscar por Nombre, DNI o Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 300, bgcolor: 'white' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button 
                        variant="contained" 
                        color="success" 
                        startIcon={<Add />} 
                        onClick={() => handleOpen()}
                    >
                        Nuevo Socio
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell fontWeight="bold">Código</TableCell>
                            <TableCell>Nombre Completo</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* MAPEAMOS LA LISTA FILTRADA */}
                        {filteredMembers.map((member) => (
                            <TableRow key={member.socioId} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{member.codigo}</TableCell>
                                <TableCell>{member.nombreCompleto}</TableCell>
                                <TableCell>{member.email}</TableCell>
                                <TableCell>
                                    <span style={{ 
                                        backgroundColor: member.tipoSocio === 'Docente' ? '#e3f2fd' : '#f1f8e9',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px'
                                    }}>
                                        {member.tipoSocio}
                                    </span>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleOpen(member)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(member.socioId)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* MENSAJE SI NO HAY RESULTADOS */}
                        {filteredMembers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No se encontraron socios con ese criterio.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* MODAL */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEdit ? 'Editar Socio' : 'Nuevo Socio'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus margin="dense" label="Código (DNI/Matrícula)" fullWidth
                        value={formData.codigo}
                        onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    />
                    <TextField
                        margin="dense" label="Nombre Completo" fullWidth
                        value={formData.nombreCompleto}
                        onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
                    />
                    <TextField
                        margin="dense" label="Correo Electrónico" type="email" fullWidth
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <TextField
                        select margin="dense" label="Tipo de Socio" fullWidth
                        value={formData.tipoSocio}
                        onChange={(e) => setFormData({...formData, tipoSocio: e.target.value})}
                    >
                        <MenuItem value="Estudiante">Estudiante</MenuItem>
                        <MenuItem value="Docente">Docente</MenuItem>
                        <MenuItem value="Administrativo">Administrativo</MenuItem>
                        <MenuItem value="Investigador">Investigador</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancelar</Button>
                    <Button onClick={handleSave} variant="contained" color="success">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Members;