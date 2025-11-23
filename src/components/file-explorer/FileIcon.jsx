/**
 * FileIcon Component
 * Displays appropriate icon for file types
 */

import { getFileIcon } from '../../utils/formatters';

export const FileIcon = ({ filename, isFolder = false, className = "w-5 h-5" }) => {
    const IconComponent = getFileIcon(filename, isFolder);

    const getIconColor = () => {
        if (isFolder) return 'text-yellow-400';

        const ext = filename?.split('.').pop()?.toLowerCase();

        // Color coding by file type
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'text-green-400';
        if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return 'text-purple-400';
        if (['mp3', 'wav', 'ogg'].includes(ext)) return 'text-pink-400';
        if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return 'text-blue-400';
        if (['zip', 'rar', '7z', 'tar'].includes(ext)) return 'text-orange-400';
        if (['js', 'jsx', 'ts', 'tsx', 'py', 'java'].includes(ext)) return 'text-cyan-400';

        return 'text-gray-400';
    };

    return (
        <IconComponent className={`${className} ${getIconColor()}`} />
    );
};
