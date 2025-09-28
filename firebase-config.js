
// firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, onSnapshot } from "firebase/firestore";

// Sua configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAWVI9VHvxARMSM3JV-bXs_73UjKh25mn4",
  authDomain: "thebaldi-me.firebaseapp.com",
  projectId: "thebaldi-me",
  storageBucket: "thebaldi-me.firebasestorage.app",
  messagingSenderId: "794996190135",
  appId: "1:794996190135:web:444f87525f52d79c7d5632"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Classe para gerenciar dados no Firestore
class FirestoreManager {
  constructor() {
    this.db = db;
    this.collections = {
      users: 'portfolio-users',
      admin: 'admin-config',
      sessions: 'user-sessions'
    };
  }

  // OPERAÇÕES GENÉRICAS
  async setData(collectionName, docId, data) {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await setDoc(docRef, data, { merge: true });
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  }

  async getData(collectionName, docId) {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return null;
    }
  }

  async updateData(collectionName, docId, data) {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      return false;
    }
  }

  async deleteData(collectionName, docId) {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erro ao deletar dados:', error);
      return false;
    }
  }

  // OPERAÇÕES ESPECÍFICAS PARA USUÁRIOS
  async getUsers() {
    try {
      const data = await this.getData(this.collections.users, 'all-users');
      return data ? data.users : {};
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return {};
    }
  }

  async saveUsers(users) {
    return await this.setData(this.collections.users, 'all-users', { users: users });
  }

  async addUser(email, userData) {
    try {
      const currentUsers = await this.getUsers();
      currentUsers[email] = userData;
      return await this.saveUsers(currentUsers);
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      return false;
    }
  }

  async updateUser(email, userData) {
    try {
      const currentUsers = await this.getUsers();
      if (currentUsers[email]) {
        currentUsers[email] = { ...currentUsers[email], ...userData };
        return await this.saveUsers(currentUsers);
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }
  }

  async deleteUser(email) {
    try {
      const currentUsers = await this.getUsers();
      delete currentUsers[email];
      return await this.saveUsers(currentUsers);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  }

  // OPERAÇÕES ESPECÍFICAS PARA ADMIN
  async getAdminPassword() {
    try {
      const data = await this.getData(this.collections.admin, 'config');
      return data ? data.password : '123456';
    } catch (error) {
      console.error('Erro ao buscar senha admin:', error);
      return '123456';
    }
  }

  async setAdminPassword(password) {
    return await this.setData(this.collections.admin, 'config', { password: password });
  }

  // OPERAÇÕES ESPECÍFICAS PARA SESSÕES
  async setUserSession(email, isAuthenticated = true) {
    const sessionData = {
      email: email,
      isAuthenticated: isAuthenticated,
      timestamp: Date.now()
    };
    return await this.setData(this.collections.sessions, 'current-session', sessionData);
  }

  async getUserSession() {
    return await this.getData(this.collections.sessions, 'current-session');
  }

  async clearUserSession() {
    return await this.deleteData(this.collections.sessions, 'current-session');
  }

  // OPERAÇÕES PARA TENTATIVAS DE LOGIN
  async getLoginAttempts() {
    try {
      const data = await this.getData(this.collections.admin, 'login-attempts');
      return data ? { attempts: data.attempts || 0, lastAttempt: data.lastAttempt || 0 } : { attempts: 0, lastAttempt: 0 };
    } catch (error) {
      console.error('Erro ao buscar tentativas de login:', error);
      return { attempts: 0, lastAttempt: 0 };
    }
  }

  async setLoginAttempts(attempts, lastAttempt) {
    return await this.setData(this.collections.admin, 'login-attempts', { attempts: attempts, lastAttempt: lastAttempt });
  }

  async clearLoginAttempts() {
    return await this.deleteData(this.collections.admin, 'login-attempts');
  }
}

// Exportar instância única
const firestoreManager = new FirestoreManager();
export default firestoreManager;
