import React, { useEffect, useState } from "react";
import Button from "../Button";
import "./App.scss";
import NumberDisplay from "../NumberDisplay";
import { generateCells, openMultipleCells } from "../../utils";
import { Cell, CellState, CellValue, Face } from "../../types";
import { MAX_ROWS, MAX_COLS } from "../../constants";


const App: React.FC = () => {
    const [cells, setCells] = useState<Cell[][]>(generateCells());
    const [face, setFace] = useState<Face>(Face.smile);
    const [time, setTime] = useState<number>(0);
    const [live, setLive] = useState<boolean>(false);
    const [bombCounter, setBombCounter] = useState<number>(10);
    const [hasLost, setHasLost] = useState<boolean>(false);
    const [hasWon, setHasWon] = useState<boolean>(false)
    useEffect(() => {
        if (hasLost || hasWon) {
            return;
        }
        const handleMousedown = ():void => {
            setFace(Face.oh);
        };
        const handleMouseup = ():void => {
            setFace(Face.smile);
        };
        window.addEventListener('mousedown', handleMousedown);
        window.addEventListener('mouseup', handleMouseup);
        return () => {
            window.removeEventListener('mousedown', handleMousedown);
            window.removeEventListener('mouseup', handleMouseup);
        }
    }, [hasLost,hasWon]);
    useEffect(() => {
        if (live && time < 999) {
            const timer = setInterval(() => {
                setTime(time + 1);
            }, 1000);
            return () => {
                clearInterval(timer);
            };
        }
    },[live,time])
    // console.log("cells", cells);
    useEffect(() => {
        if (hasLost) {
            setFace(Face.lost);
            setLive(false);
        }
    }, [hasLost])
    useEffect(() => {
        if (hasWon) {
            setFace(Face.won);
            setLive(false);
        }
    }, [hasWon])
    const handleCellClick = (rowParam: number, colParam: number) => (): void => {

        let newCells = cells.slice();

        if (!live) {
            let isABomb = newCells[rowParam][colParam].value === CellValue.bomb;
            while (isABomb) {
                newCells = generateCells();
                if (newCells[rowParam][colParam].value !== CellValue.bomb) {
                    isABomb = false;
                    break;
                }
            }
            setLive(true);
        }

        if (hasLost || hasWon) {
            return;
        }
        const currentCell = newCells[rowParam][colParam];

        if ([CellState.flagged, CellState.visible].includes(currentCell.state)) {
            return;
        }

        if (currentCell.value === CellValue.bomb) {
            setHasLost(true);
            newCells[rowParam][colParam].red = true;
            newCells = showAllBombs();
            setCells(newCells);
            return;
        } else if (currentCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam, colParam);
        } else {
            newCells[rowParam][colParam].state = CellState.visible;
        }

        let safeOpenCellsExists = false;
        for (let row = 0; row < MAX_ROWS; row++) {
            for (let col = 0; col < MAX_COLS; col++){
                const currentCell = newCells[row][col];
                if (currentCell.value !== CellValue.bomb && currentCell.state === CellState.open) {
                    safeOpenCellsExists = true;
                    break;
                }
            }
        }
        if (!safeOpenCellsExists) {
            newCells = newCells.map(row => row.map(cell => {
                if (cell.value === CellValue.bomb) {
                    return {
                        ...cell,
                        state: CellState.flagged
                    }
                }
                return cell;
            }))
            setHasWon(true);
        }
        setCells(newCells);
    }
    const handleCellContext = (rowParam: number, colParam: number) => (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ): void => {
        e.preventDefault();

        if (!live) {
            return;
        }

        const currentCells = cells.slice();
        let currentCell = cells[rowParam][colParam];
        if (currentCell.state === CellState.visible) {
            return;
        } else if (currentCell.state === CellState.open) {
            // if (bombCounter > 0) {
                currentCells[rowParam][colParam].state = CellState.flagged;
                setBombCounter(bombCounter - 1);                
            // }
        } else if (currentCell.state === CellState.flagged) {
                currentCells[rowParam][colParam].state = CellState.open;
                setBombCounter(bombCounter + 1);
        }
        // console.log("we are in right click")
        setCells(currentCells); 
    }
    const handleFaceClick = (): void => {
        setLive(false);
        setTime(0);
        setCells(generateCells());
        setBombCounter(10);
        setFace(Face.smile);
        setHasLost(false);
        setHasWon(false);
    }

    const renderCells = (): React.ReactNode => {
        return cells.map((row, rowIndex) => row.map((cell, colIndex) => (
            <Button
                key={`${rowIndex}-${colIndex}`}
                onClick={handleCellClick}
                onContext={handleCellContext}
                state={cell.state}
                value={cell.value}
                red={cell.red}
                row={rowIndex}
                col={colIndex} />
            ))
        );
    }

    const showAllBombs = (): Cell[][]=> {
        const currentCells = cells.slice();
        return currentCells.map(row =>
            row.map(cell => {
            if (cell.value === CellValue.bomb) {
                    return {
                        ...cell,
                        state: CellState.visible
                    };
                }
                
            return cell;
        }))
    }
    return <div className="App" >
        <div className="Header">
            <NumberDisplay value={bombCounter} />
            <div className="Face" onClick ={handleFaceClick}>
                <span role="img" aria-label="face">
                    {face}
                </span>
            </div>
            <NumberDisplay value={time} />
        </div>
        <div className="Body">{renderCells()}</div>
    </div>;
};

export default App;
