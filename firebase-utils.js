// firebase-utils.js
import { 
    db, 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    getDoc, 
    setDoc,
    query,
    where,
    orderBy 
} from './firebase-config.js';

// Classe para gerenciar usuários no Firestore
class FirebaseUserManager {
    constructor() {
        this.usersCollection = 'portfolio_users';
        this.adminCollection = 'admin_settings';
        this.logsCollection = 'system_logs';
    }

    // Adicionar um novo usuário
    async addUser(userData) {
        try {
            // Usar o email como ID do documento para evitar duplicatas
            const userDocId = userData.email.toLowerCase().replace(/[.]/g, '_');
            const userRef = doc(db, this.usersCollection, userDocId);
            
            const newUser = {
                ...userData,
                email: userData.email.toLowerCase(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isFirstLogin: true
            };
            
            await setDoc(userRef, newUser);
            await this.logActivity('user_added', userData.email, { action: 'Usuário adicionado' });
            return { success: true, user: newUser };
        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            return { success: false, error: error.message };
        }
    }

    // Buscar todos os usuários
    async getAllUsers() {
        try {
            const usersRef = collection(db, this.usersCollection);
            const querySnapshot = await getDocs(usersRef);
            const users = {};
            
            querySnapshot.forEach((doc) => {
                users[doc.data().email] = { ...doc.data(), id: doc.id };
            });
            
            return { success: true, users };
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return { success: false, error: error.message };
        }
    }

    // Buscar usuário por email
    async getUserByEmail(email) {
        try {
            const userDocId = email.toLowerCase().replace(/[.]/g, '_');
            const userRef = doc(db, this.usersCollection, userDocId);
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists()) {
                return { success: true, user: docSnap.data() };
            } else {
                return { success: false, error: 'Usuário não encontrado' };
            }
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return { success: false, error: error.message };
        }
    }

    // Atualizar usuário
    async updateUser(email, updateData) {
        try {
            const userDocId = email.toLowerCase().replace(/[.]/g, '_');
            const userRef = doc(db, this.usersCollection, userDocId);
            
            const updatedData = {
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            
            await updateDoc(userRef, updatedData);
            await this.logActivity('user_updated', email, { action: 'Usuário atualizado', changes: updateData });
            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return { success: false, error: error.message };
        }
    }

    // Deletar usuário
    async deleteUser(email) {
        try {
            const userDocId = email.toLowerCase().replace(/[.]/g, '_');
            const userRef = doc(db, this.usersCollection, userDocId);
            
            await deleteDoc(userRef);
            await this.logActivity('user_deleted', email, { action: 'Usuário removido' });
            return { success: true };
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            return { success: false, error: error.message };
        }
    }

    // Alterar senha do usuário
    async changeUserPassword(email, newPassword, isFirstLogin = false) {
        try {
            const updateData = {
                password: newPassword,
                isFirstLogin: isFirstLogin,
                updatedAt: new Date().toISOString()
            };

            if (!isFirstLogin) {
                updateData.passwordChangedAt = new Date().toISOString();
            }

            const result = await this.updateUser(email, updateData);
            if (result.success) {
                await this.logActivity('password_changed', email, { 
                    action: isFirstLogin ? 'Primeira alteração de senha' : 'Senha alterada' 
                });
            }
            return result;
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            return { success: false, error: error.message };
        }
    }

    // Gerenciar configurações do admin
    async getAdminSettings() {
        try {
            const adminRef = doc(db, this.adminCollection, 'main');
            const docSnap = await getDoc(adminRef);
            
            if (docSnap.exists()) {
                return { success: true, settings: docSnap.data() };
            } else {
                // Criar configurações padrão se não existir
                const defaultSettings = {
                    adminEmail: 'compras.thebaldi@gmail.com',
                    adminPassword: '123456',
                    lastAccess: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };
                
                await setDoc(adminRef, defaultSettings);
                return { success: true, settings: defaultSettings };
            }
        } catch (error) {
            console.error('Erro ao buscar configurações do admin:', error);
            return { success: false, error: error.message };
        }
    }

    // Atualizar configurações do admin
    async updateAdminSettings(updateData) {
        try {
            const adminRef = doc(db, this.adminCollection, 'main');
            const updatedData = {
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            
            await updateDoc(adminRef, updatedData);
            await this.logActivity('admin_updated', 'system', { action: 'Configurações admin atualizadas' });
            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar configurações do admin:', error);
            return { success: false, error: error.message };
        }
    }

    // Registrar atividade/log
    async logActivity(action, userEmail, details = {}) {
        try {
            const logData = {
                action,
                userEmail,
                details,
                timestamp: new Date().toISOString(),
                ip: 'client-side' // Em produção você pode capturar o IP real
            };
            
            await addDoc(collection(db, this.logsCollection), logData);
            return { success: true };
        } catch (error) {
            console.error('Erro ao registrar log:', error);
            return { success: false, error: error.message };
        }
    }

    // Buscar logs recentes
    async getRecentLogs(limit = 50) {
        try {
            const logsRef = collection(db, this.logsCollection);
            const q = query(logsRef, orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const logs = [];
            let count = 0;
            querySnapshot.forEach((doc) => {
                if (count < limit) {
                    logs.push({ id: doc.id, ...doc.data() });
                    count++;
                }
            });
            
            return { success: true, logs };
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
            return { success: false, error: error.message };
        }
    }

    // Fazer backup dos dados
    async backupData() {
        try {
            const usersResult = await this.getAllUsers();
            const adminResult = await this.getAdminSettings();
            const logsResult = await this.getRecentLogs(100);
            
            const backupData = {
                users: usersResult.success ? usersResult.users : {},
                admin: adminResult.success ? adminResult.settings : {},
                logs: logsResult.success ? logsResult.logs : [],
                timestamp: new Date().toISOString(),
                version: '2.0.1'
            };
            
            return { success: true, data: backupData };
        } catch (error) {
            console.error('Erro ao fazer backup:', error);
            return { success: false, error: error.message };
        }
    }
}

// Exportar instância única do gerenciador
export const firebaseUserManager = new FirebaseUserManager();