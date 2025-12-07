import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Converte uma data do formato do input HTML (yyyy-MM-dd) para Date
 */
export function parseInputDate(dateString: string): Date {
  if (!dateString) return new Date();
  return parse(dateString, 'yyyy-MM-dd', new Date());
}

/**
 * Converte uma Date para o formato do input HTML (yyyy-MM-dd)
 */
export function formatToInputDate(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Formata uma data para exibição no padrão brasileiro (dd/MM/yyyy)
 */
export function formatToBrazilianDate(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Formata uma data com hora para exibição no padrão brasileiro (dd/MM/yyyy HH:mm)
 */
export function formatToBrazilianDateTime(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/**
 * Converte uma data para ISO string sem timezone (para enviar ao backend)
 */
export function toISODateString(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseInputDate(date) : date;
  // Remove timezone para evitar problemas de fuso horário
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
