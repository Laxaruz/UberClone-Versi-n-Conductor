import { useDriver } from '../context/DriverContext';
import { translate } from './translations';

export default function useTranslation() {
  const { language } = useDriver();
  return (key) => translate(language, key);
}
