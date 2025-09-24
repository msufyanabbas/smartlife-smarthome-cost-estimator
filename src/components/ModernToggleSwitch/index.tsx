// Modern Toggle Switch Component
const ModernToggleSwitch: React.FC<{
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isOn, onToggle, disabled = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-12 h-6',
    lg: 'w-16 h-8'
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
        ${sizeClasses[size]}
        ${isOn 
          ? 'bg-gradient-to-r from-green-400 to-green-600' 
          : 'bg-gray-300'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out
          ${thumbSizeClasses[size]}
          ${isOn ? 'translate-x-full' : 'translate-x-0'}
        `}
      />
    </button>
  );
};
export default ModernToggleSwitch;