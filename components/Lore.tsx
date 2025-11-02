
import React from 'react';
import { LORE_CONTENT } from '../constants';

export const Lore: React.FC = () => {
    return (
        <div 
            className="lore-content" 
            dangerouslySetInnerHTML={{ __html: LORE_CONTENT }}
        />
    );
};
