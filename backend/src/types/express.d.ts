// O middleware verifyToken poe o conteudo do token em req.user. Nada
// declarava isso, e o compilador antigo deixava passar; o atual nao.
import { Usuario } from '../utils/usuario';

declare global {
    namespace Express {
        interface Request {
            user?: Usuario;
        }
    }
}

export {};
