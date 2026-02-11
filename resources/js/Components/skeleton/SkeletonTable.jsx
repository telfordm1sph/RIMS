import React from "react";
import { Skeleton } from "antd";

const SkeletonTable = ({ columns = 5, rows = 5 }) => {
    // Always use numeric values, not the array length
    const numColumns = typeof columns === "number" ? columns : 5;
    const numRows = typeof rows === "number" ? rows : 5;

    return (
        <table className="w-full">
            <tbody>
                {Array.from({ length: numRows }).map((_, i) => (
                    <tr key={i}>
                        {Array.from({ length: numColumns }).map((_, j) => (
                            <td key={j} className="p-2">
                                <Skeleton.Input
                                    style={{ width: "100%" }}
                                    active
                                    size="small"
                                />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SkeletonTable;
