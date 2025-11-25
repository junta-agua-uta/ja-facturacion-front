// Sistema de notificaciones Toast para el proyecto

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  message: string;
  type: NotificationType;
  duration?: number; // en milisegundos
}

export const showNotification = ({ message, type, duration = 4000 }: NotificationOptions) => {
  // Crear contenedor de toasts si no existe
  let toastContainer = document.getElementById('toast-notifications');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-notifications';
    toastContainer.className = 'toast toast-top toast-end z-[9999]';
    document.body.appendChild(toastContainer);
  }

  // Crear el toast
  const toast = document.createElement('div');
  const alertClass = getAlertClass(type);
  toast.className = `alert ${alertClass} shadow-lg mb-2 animate-fadeIn`;
  
  // Icono según el tipo
  const icon = getIcon(type);
  
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      ${icon}
      <span class="text-sm font-medium">${message}</span>
    </div>
  `;

  // Agregar el toast al contenedor
  toastContainer.appendChild(toast);

  // Remover el toast después del tiempo especificado
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
      // Si no hay más toasts, remover el contenedor
      if (toastContainer && toastContainer.children.length === 0) {
        toastContainer.remove();
      }
    }, 300);
  }, duration);
};

const getAlertClass = (type: NotificationType): string => {
  switch (type) {
    case 'success':
      return 'alert-success';
    case 'error':
      return 'alert-error';
    case 'warning':
      return 'alert-warning';
    case 'info':
      return 'alert-info';
    default:
      return 'alert-info';
  }
};

const getIcon = (type: NotificationType): string => {
  switch (type) {
    case 'success':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    case 'error':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    case 'warning':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      `;
    case 'info':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
    default:
      return '';
  }
};

// Funciones de ayuda para tipos específicos
export const showSuccess = (message: string, duration?: number) => {
  showNotification({ message, type: 'success', duration });
};

export const showError = (message: string, duration?: number) => {
  showNotification({ message, type: 'error', duration });
};

export const showWarning = (message: string, duration?: number) => {
  showNotification({ message, type: 'warning', duration });
};

export const showInfo = (message: string, duration?: number) => {
  showNotification({ message, type: 'info', duration });
};
