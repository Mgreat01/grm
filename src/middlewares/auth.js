import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  try {
    const [scheme, token] = (req.headers.authorization || "").split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Authentification requise." });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET non défini");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: payload.id },
      select: { id: true, type: true, estActif: true },
    });

    if (!utilisateur?.estActif || utilisateur.type !== payload.role) {
      return res.status(401).json({ message: "Session invalide ou compte inactif." });
    }

    req.user = { id: utilisateur.id, role: utilisateur.type };
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Jeton invalide ou expiré." });
    }

    return next(error);
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Accès interdit." });
  }

  return next();
};

export const requireSelfOrRole = (paramName, ...roles) => (req, res, next) => {
  const resourceOwnerId = Number.parseInt(req.params[paramName], 10);

  if (roles.includes(req.user?.role) || req.user?.id === resourceOwnerId) {
    return next();
  }

  return res.status(403).json({ message: "Accès interdit à cette ressource." });
};
