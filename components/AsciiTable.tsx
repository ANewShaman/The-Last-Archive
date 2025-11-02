
import React from 'react';

export const AsciiTable: React.FC = () => {
    const tableData: { char: string, dec: number }[] = [];
    for (let i = 65; i <= 90; i++) {
        tableData.push({ char: String.fromCharCode(i), dec: i });
    }

    return (
        <div className="text-lime-400 text-sm">
            <p className="font-bold underline mb-2">ASCII to Decimal (A-Z)</p>
            <table>
                <thead>
                    <tr>
                        <th className="pr-4 text-left">Char</th>
                        <th className="text-left">Decimal</th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map(({ char, dec }) => (
                        <tr key={char}>
                            <td>{char}</td>
                            <td>{dec}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
