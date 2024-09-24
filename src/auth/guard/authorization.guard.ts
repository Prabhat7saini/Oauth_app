// import {
//     CanActivate,
//     ExecutionContext,
//     ForbiddenException,
//     Injectable,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Observable } from 'rxjs';
// import { ROLES_KEY } from '../../utils/decorators/roles.decorator';
// import { ERROR_MESSAGES } from '../../utils/constants/message';

// @Injectable()
// export class AuthorizationGuard implements CanActivate {
//     constructor(private readonly reflection: Reflector) { }
//     canActivate(
//         context: ExecutionContext,
//     ): boolean | Promise<boolean> | Observable<boolean> {
//         try {
//             const request = context.switchToHttp().getRequest();
//             // console.log(`request: ${request.user.role}`)
//             const requiredRole = this.reflection.get(ROLES_KEY, context.getHandler());

//             if (requiredRole !== request.user.role) {
//                 throw new ForbiddenException(ERROR_MESSAGES.ACCESS_DENIED);
//             }

//             return true;
//         } catch (error) {
//             // console.log(`error in side the user authorization`, error.message);
//             throw error;
//         }
//     }
// }

















import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../../utils/decorators/roles.decorator';
import { ERROR_MESSAGES } from '../../utils/constants/message';

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
            console.log(requiredRoles, "inside the authorization requiredrole")

            if (!requiredRoles) {
                return true; // If no roles are required, allow access
            }

            const userRole = request.user.role; // Assuming user.role is a single string
            console.log(userRole, "inside the authorization userRole")
            // Check if the user has one of the required roles
            const hasRole = requiredRoles.includes(userRole);

            if (!hasRole) {
                throw new ForbiddenException(ERROR_MESSAGES.ACCESS_DENIED);
            }

            return true;
        } catch (error) {
            throw error; // Rethrow the error to be handled by NestJS
        }
    }
}
