export const isAdmin = (req, res, next) => {
    // Verificar si el usuario está autenticado
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar si el usuario es administrador
    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Acceso denegado. No eres un administrador' });
    }

    // Si el usuario está autenticado y es administrador, permitir el acceso a la ruta
    next();
};