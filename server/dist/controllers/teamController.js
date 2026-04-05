"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserFromTeam = exports.addUserToTeam = exports.deleteTeam = exports.updateTeam = exports.createTeam = exports.getTeams = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTeams = async (req, res) => {
    try {
        const teams = await prisma.team.findMany({
            include: { users: true },
        });
        res.json(teams);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching teams", error: error.message });
    }
};
exports.getTeams = getTeams;
const createTeam = async (req, res) => {
    const { teamName, productOwnerUserId, projectManagerUserId } = req.body;
    try {
        const team = await prisma.team.create({
            data: {
                teamName,
                productOwnerUserId: productOwnerUserId ? Number(productOwnerUserId) : null,
                projectManagerUserId: projectManagerUserId ? Number(projectManagerUserId) : null,
            },
        });
        res.status(201).json(team);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating team", error: error.message });
    }
};
exports.createTeam = createTeam;
const updateTeam = async (req, res) => {
    const { teamId } = req.params;
    const { teamName, productOwnerUserId, projectManagerUserId } = req.body;
    try {
        const team = await prisma.team.update({
            where: { id: Number(teamId) },
            data: {
                teamName,
                productOwnerUserId: productOwnerUserId ? Number(productOwnerUserId) : null,
                projectManagerUserId: projectManagerUserId ? Number(projectManagerUserId) : null,
            },
        });
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating team", error: error.message });
    }
};
exports.updateTeam = updateTeam;
const deleteTeam = async (req, res) => {
    const { teamId } = req.params;
    try {
        await prisma.team.delete({ where: { id: Number(teamId) } });
        res.json({ message: "Team deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting team", error: error.message });
    }
};
exports.deleteTeam = deleteTeam;
const addUserToTeam = async (req, res) => {
    const { teamId } = req.params;
    const { userId } = req.body;
    try {
        const user = await prisma.user.update({
            where: { userId: Number(userId) },
            data: { teamId: Number(teamId) },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding user to team", error: error.message });
    }
};
exports.addUserToTeam = addUserToTeam;
const removeUserFromTeam = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await prisma.user.update({
            where: { userId: Number(userId) },
            data: { teamId: null },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error removing user from team", error: error.message });
    }
};
exports.removeUserFromTeam = removeUserFromTeam;
