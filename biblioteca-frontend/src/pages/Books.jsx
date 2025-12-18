import { useState, useEffect } from 'react';
import { 
    Box, Button, Typography, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, IconButton, 
    Dialog, DialogTitle, DialogContent, TextField, DialogActions 
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [open, setOpen] = useState(false); // Controla si el Modal está abierto
    const [isEdit, setIsEdit] = useState(false); // ¿Estamos creando o editando?
    
    // Estado para el formulario
    const [formData, setFormData] = useState({
        libroId: 0,
        titulo: '',
        autor: '',
        editorial: '',
        isbn: '',
        anioPublicacion: '',
        categoriaId: 1 // Default
    });

    // 1. CARGAR LIBROS AL INICIAR
    const fetchBooks = async () => {
        try {
            const response = await api.get('/books');
            setBooks(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    // 2. ABRIR MODAL (Para crear o editar)
    const handleOpen = (book = null) => {
        if (book) {
            setIsEdit(true);
            setFormData(book); // Rellenar con datos existentes
        } else {
            setIsEdit(false);
            setFormData({
                libroId: 0, titulo: '', autor: '', editorial: '', 
                isbn: '', anioPublicacion: '', categoriaId: 1
            });
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    // 3. GUARDAR (Crear o Actualizar)
    const handleSave = async () => {
        try {
            const inquilinoId = parseInt(localStorage.getItem('inquilinoId'));
            const payload = { ...formData, inquilinoId }; // Agregamos el ID de la biblioteca

            if (isEdit) {
                // EDITAR (PUT)
                await api.put(`/books/${formData.libroId}`, payload);
                Swal.fire('Actualizado', 'El libro se actualizó correctamente', 'success');
            } else {
                // CREAR (POST)
                await api.post('/books', payload);
                Swal.fire('Creado', 'Libro registrado con éxito', 'success');
            }
            
            setOpen(false);
            fetchBooks(); // Recargar la tabla
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo guardar el libro', 'error');
        }
    };

    // 4. ELIMINAR
    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto. Si el libro tiene préstamos, fallará.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/books/${id}`);
                    Swal.fire('Eliminado', 'El libro ha sido eliminado.', 'success');
                    fetchBooks();
                } catch (error) {
                    Swal.fire('Error', 'No se puede eliminar (¿Tiene copias o préstamos?)', 'error');
                }
            }
        });
    };

    return (
        <Box>
            {/* ENCABEZADO */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Catálogo de Libros</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => handleOpen()}
                >
                    Nuevo Libro
                </Button>
            </Box>

            {/* TABLA DE DATOS */}
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell fontWeight="bold">Título</TableCell>
                            <TableCell>Autor</TableCell>
                            <TableCell>Editorial</TableCell>
                            <TableCell>ISBN</TableCell>
                            <TableCell>Año</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {books.map((book) => (
                            <TableRow key={book.libroId} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{book.titulo}</TableCell>
                                <TableCell>{book.autor}</TableCell>
                                <TableCell>{book.editorial}</TableCell>
                                <TableCell>{book.isbn}</TableCell>
                                <TableCell>{book.anioPublicacion}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleOpen(book)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(book.libroId)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {books.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No hay libros registrados aún.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* MODAL (FORMULARIO POPUP) */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEdit ? 'Editar Libro' : 'Nuevo Libro'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus margin="dense" label="Título" fullWidth
                        value={formData.titulo}
                        onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    />
                    <TextField
                        margin="dense" label="Autor" fullWidth
                        value={formData.autor}
                        onChange={(e) => setFormData({...formData, autor: e.target.value})}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            margin="dense" label="Editorial" fullWidth
                            value={formData.editorial}
                            onChange={(e) => setFormData({...formData, editorial: e.target.value})}
                        />
                        <TextField
                            margin="dense" label="Año" type="number" fullWidth
                            value={formData.anioPublicacion}
                            onChange={(e) => setFormData({...formData, anioPublicacion: e.target.value})}
                        />
                    </Box>
                    <TextField
                        margin="dense" label="ISBN" fullWidth
                        value={formData.isbn}
                        onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Books;