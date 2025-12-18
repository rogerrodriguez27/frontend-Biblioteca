import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
    Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, 
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Divider, IconButton, Avatar, Menu, MenuItem 
} from '@mui/material';
import { 
    Menu as MenuIcon, 
    Dashboard as DashboardIcon, 
    MenuBook as BookIcon, 
    People as PeopleIcon, 
    Assignment as LoanIcon, 
    ExitToApp as LogoutIcon,
    Business as BusinessIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    // Recuperar nombre del usuario
    const usuarioNombre = localStorage.getItem('usuario') || 'Usuario';

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // Limpiar todo y salir
        localStorage.clear();
        navigate('/login');
    };

    // DEFINICIÓN DEL MENÚ LATERAL
    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Libros', icon: <BookIcon />, path: '/books' },
        { text: 'Socios', icon: <PeopleIcon />, path: '/members' },
        { text: 'Préstamos', icon: <LoanIcon />, path: '/loans' },
        // Puedes agregar 'Usuarios' aquí si es Admin
    ];

    const drawer = (
        <div>
            <Toolbar sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                <BusinessIcon sx={{ mr: 2 }} />
                <Typography variant="h6" noWrap component="div">
                    Biblioteca SaaS
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton 
                            onClick={() => navigate(item.path)}
                            selected={location.pathname === item.path}
                        >
                            <ListItemIcon color={location.pathname === item.path ? "primary" : "inherit"}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            
            {/* BARRA SUPERIOR (NAVBAR) */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'white', color: 'black', boxShadow: 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    
                    {/* Espaciador para empujar el usuario a la derecha */}
                    <Box sx={{ flexGrow: 1 }} />

                    <Typography variant="subtitle1" sx={{ mr: 2, fontWeight: 'bold' }}>
                        {usuarioNombre}
                    </Typography>
                    
                    <IconButton onClick={handleMenu} size="small">
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {usuarioNombre.charAt(0).toUpperCase()}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                            Cerrar Sesión
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* CAJÓN LATERAL (SIDEBAR) */}
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                {/* Versión Móvil */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                {/* Versión Desktop */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* CONTENIDO PRINCIPAL (Aquí se pintarán las páginas) */}
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}
            >
                <Outlet /> {/* <--- AQUÍ ENTRARÁN TUS VISTAS */}
            </Box>
        </Box>
    );
};

export default MainLayout;