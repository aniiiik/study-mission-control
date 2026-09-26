import { useEffect, useState } from 'react'
import {
  Calculator as CalculatorIcon,
  Delete,
  Equal,
  History,
  Minus,
  Plus,
  X,
} from 'lucide-react'

interface CalculatorProps {
  onClose: () => void
}

type CalculatorMode = 'normal' | 'scientific' | 'gate'

interface CalculationHistory {
  id: number
  expression: string
  result: string
}

const HISTORY_STORAGE_KEY =
  'study-mission-control-calculator-history'

function Calculator({ onClose }: CalculatorProps) {
  const [mode, setMode] =
    useState<CalculatorMode>('normal')

  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')

  const [previousValue, setPreviousValue] =
    useState<number | null>(null)

  const [operator, setOperator] =
    useState<string | null>(null)

  const [waitingForOperand, setWaitingForOperand] =
    useState(false)

  const [memory, setMemory] = useState(0)

  const [history, setHistory] = useState<
    CalculationHistory[]
  >(() => {
    try {
      const saved = localStorage.getItem(
        HISTORY_STORAGE_KEY,
      )

      if (!saved) {
        return []
      }

      const parsed = JSON.parse(saved)

      return Array.isArray(parsed)
        ? parsed.slice(0, 10)
        : []
    } catch {
      return []
    }
  })

  // --------------------------------
  // Save history
  // --------------------------------

  useEffect(() => {
    try {
      localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(history),
      )
    } catch {
      // Ignore localStorage errors.
    }
  }, [history])

  // --------------------------------
  // Add history
  // --------------------------------

  const addToHistory = (
    calculationExpression: string,
    result: string,
  ) => {
    const newItem: CalculationHistory = {
      id:
        Date.now() +
        Math.random(),
      expression: calculationExpression,
      result,
    }

    setHistory((current) =>
      [newItem, ...current].slice(0, 10),
    )
  }

  // --------------------------------
  // Format number
  // --------------------------------

  const formatNumber = (value: number) => {
    if (!Number.isFinite(value)) {
      return 'Error'
    }

    if (Math.abs(value) >= 1e12) {
      return value.toExponential(8)
    }

    if (
      value !== 0 &&
      Math.abs(value) < 1e-10
    ) {
      return value.toExponential(8)
    }

    return Number(
      value.toPrecision(12),
    ).toString()
  }

  // --------------------------------
  // Input digit
  // --------------------------------

  const inputDigit = (digit: string) => {
    if (
      display === 'Error' ||
      display === 'Infinity' ||
      display === '-Infinity'
    ) {
      setDisplay(digit)
      setExpression(digit)
      setPreviousValue(null)
      setOperator(null)
      setWaitingForOperand(false)
      return
    }

    if (waitingForOperand) {
      setDisplay(digit)

      setExpression((current) => {
        if (!current) {
          return digit
        }

        return `${current} ${digit}`
      })

      setWaitingForOperand(false)
      return
    }

    setDisplay((current) =>
      current === '0'
        ? digit
        : current + digit,
    )

    setExpression((current) => {
      if (!current || current === '0') {
        return digit
      }

      return current + digit
    })
  }

  // --------------------------------
  // Decimal
  // --------------------------------

  const inputDecimal = () => {
    if (
      display === 'Error' ||
      display === 'Infinity'
    ) {
      setDisplay('0.')
      setExpression('0.')
      setWaitingForOperand(false)
      return
    }

    if (waitingForOperand) {
      setDisplay('0.')

      setExpression((current) =>
        current
          ? `${current} 0.`
          : '0.',
      )

      setWaitingForOperand(false)
      return
    }

    if (!display.includes('.')) {
      setDisplay(
        (current) => `${current}.`,
      )

      setExpression(
        (current) => `${current}.`,
      )
    }
  }

  // --------------------------------
  // Clear
  // --------------------------------

  const clearCalculator = () => {
    setDisplay('0')
    setExpression('')
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }

  // --------------------------------
  // Delete
  // --------------------------------

  const deleteLast = () => {
    if (
      waitingForOperand ||
      display === 'Error'
    ) {
      return
    }

    setDisplay((current) => {
      if (current.length <= 1) {
        return '0'
      }

      return current.slice(0, -1)
    })

    setExpression((current) => {
      if (!current) {
        return ''
      }

      return current.slice(0, -1)
    })
  }

  // --------------------------------
  // Calculation engine
  // --------------------------------

  const calculate = (
    firstValue: number,
    secondValue: number,
    currentOperator: string,
  ): number | null => {
    switch (currentOperator) {
      case '+':
        return firstValue + secondValue

      case '-':
        return firstValue - secondValue

      case '×':
        return firstValue * secondValue

      case '÷':
        if (secondValue === 0) {
          return null
        }

        return firstValue / secondValue

      case '^':
        return Math.pow(
          firstValue,
          secondValue,
        )

      default:
        return secondValue
    }
  }

  // --------------------------------
  // Operator
  // --------------------------------

  const chooseOperator = (
    nextOperator: string,
  ) => {
    const inputValue = Number(display)

    if (!Number.isFinite(inputValue)) {
      return
    }

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (
      operator &&
      !waitingForOperand
    ) {
      const result = calculate(
        previousValue,
        inputValue,
        operator,
      )

      if (result === null) {
        setDisplay('Error')
        setExpression('Error')
        setPreviousValue(null)
        setOperator(null)
        setWaitingForOperand(true)
        return
      }

      const formattedResult =
        formatNumber(result)

      setDisplay(formattedResult)
      setPreviousValue(result)
    }

    setOperator(nextOperator)

    setExpression((current) => {
      const trimmed = current.trim()

      if (!trimmed) {
        return `${formatNumber(inputValue)} ${nextOperator}`
      }

      if (
        trimmed.endsWith('+') ||
        trimmed.endsWith('-') ||
        trimmed.endsWith('×') ||
        trimmed.endsWith('÷') ||
        trimmed.endsWith('^')
      ) {
        return `${trimmed.slice(
          0,
          -1,
        )}${nextOperator}`
      }

      return `${trimmed} ${nextOperator}`
    })

    setWaitingForOperand(true)
  }

  // --------------------------------
  // Equals
  // --------------------------------

  const handleEquals = () => {
    if (
      previousValue === null ||
      !operator ||
      waitingForOperand
    ) {
      return
    }

    const inputValue = Number(display)

    if (!Number.isFinite(inputValue)) {
      return
    }

    const result = calculate(
      previousValue,
      inputValue,
      operator,
    )

    const calculationExpression =
      `${formatNumber(
        previousValue,
      )} ${operator} ${formatNumber(
        inputValue,
      )}`

    if (result === null) {
      setDisplay('Error')

      setExpression(
        `${calculationExpression} = Error`,
      )

      addToHistory(
        calculationExpression,
        'Error',
      )
    } else {
      const resultText =
        formatNumber(result)

      setDisplay(resultText)

      setExpression(
        `${calculationExpression} = ${resultText}`,
      )

      addToHistory(
        calculationExpression,
        resultText,
      )
    }

    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(true)
  }

  // --------------------------------
  // Percentage
  // --------------------------------

  const percentage = () => {
    const value = Number(display)

    if (!Number.isFinite(value)) {
      return
    }

    const result = value / 100
    const resultText = formatNumber(result)

    const calculationExpression =
      `${formatNumber(value)} %`

    setDisplay(resultText)

    setExpression(
      `${calculationExpression} = ${resultText}`,
    )

    addToHistory(
      calculationExpression,
      resultText,
    )

    setWaitingForOperand(true)
  }

  // --------------------------------
  // Toggle sign
  // --------------------------------

  const toggleSign = () => {
    const value = Number(display)

    if (!Number.isFinite(value)) {
      return
    }

    const result = value * -1
    const resultText = formatNumber(result)

    setDisplay(resultText)

    setExpression(resultText)
  }

  // --------------------------------
  // Scientific / GATE operations
  // --------------------------------

  const scientificOperation = (
    operation: string,
  ) => {
    const value = Number(display)

    if (!Number.isFinite(value)) {
      return
    }

    let result: number
    let operationText = ''

    switch (operation) {
      // Square root
      case 'sqrt':
        if (value < 0) {
          setDisplay('Error')
          setExpression(
            `√(${value}) = Error`,
          )
          addToHistory(
            `√(${value})`,
            'Error',
          )
          setWaitingForOperand(true)
          return
        }

        result = Math.sqrt(value)
        operationText = `√(${value})`
        break

      // Square
      case 'square':
        result = value ** 2
        operationText = `${value}²`
        break

      // Reciprocal
      case 'reciprocal':
        if (value === 0) {
          setDisplay('Error')
          setExpression(
            `1/(${value}) = Error`,
          )
          addToHistory(
            `1/(${value})`,
            'Error',
          )
          setWaitingForOperand(true)
          return
        }

        result = 1 / value
        operationText = `1/(${value})`
        break

      // Sin degrees
      case 'sin':
        result =
          Math.sin(
            (value * Math.PI) / 180,
          )

        operationText = `sin(${value}°)`
        break

      // Cos degrees
      case 'cos':
        result =
          Math.cos(
            (value * Math.PI) / 180,
          )

        operationText = `cos(${value}°)`
        break

      // Tan degrees
      case 'tan':
        result =
          Math.tan(
            (value * Math.PI) / 180,
          )

        operationText = `tan(${value}°)`
        break

      // Inverse sin
      case 'asin':
        if (value < -1 || value > 1) {
          setDisplay('Error')
          setExpression(
            `sin⁻¹(${value}) = Error`,
          )
          addToHistory(
            `sin⁻¹(${value})`,
            'Error',
          )
          setWaitingForOperand(true)
          return
        }

        result =
          (Math.asin(value) * 180) /
          Math.PI

        operationText =
          `sin⁻¹(${value})`
        break

      // Inverse cos
      case 'acos':
        if (value < -1 || value > 1) {
          setDisplay('Error')
          setExpression(
            `cos⁻¹(${value}) = Error`,
          )
          addToHistory(
            `cos⁻¹(${value})`,
            'Error',
          )
          setWaitingForOperand(true)
          return
        }

        result =
          (Math.acos(value) * 180) /
          Math.PI

        operationText =
          `cos⁻¹(${value})`
        break

      // Inverse tan
      case 'atan':
        result =
          (Math.atan(value) * 180) /
          Math.PI

        operationText =
          `tan⁻¹(${value})`
        break

      // Log base 10
      case 'log':
        if (value <= 0) {
          setDisplay('Error')
          setExpression(
            `log(${value}) = Error`,
          )
          addToHistory(
            `log(${value})`,
            'Error',
          )
          setWaitingForOperand(true)
          return
        }

        result = Math.log10(value)
        operationText = `log(${value})`
        break

      // Natural log
      case 'ln':
        if (value <= 0) {
          setDisplay('Error')
          setExpression(
            `ln(${value}) = Error`,
          )
          addToHistory(
            `ln(${value})`,
            'Error',
          )
          setWaitingForOperand(true)
          return
        }

        result = Math.log(value)
        operationText = `ln(${value})`
        break

      // e^x
      case 'exp':
        result = Math.exp(value)
        operationText = `e^(${value})`
        break

      // 10^x
      case 'pow10':
        result = Math.pow(10, value)
        operationText = `10^(${value})`
        break

      // Factorial
      case 'factorial': {
        if (
          value < 0 ||
          !Number.isInteger(value) ||
          value > 170
        ) {
          setDisplay('Error')
          setExpression(
            `${value}! = Error`,
          )
          addToHistory(
            `${value}!`,
            'Error',
          )
          setWaitingForOperand(true)
          return
        }

        let factorialResult = 1

        for (
          let i = 2;
          i <= value;
          i += 1
        ) {
          factorialResult *= i
        }

        result = factorialResult
        operationText = `${value}!`
        break
      }

      // Pi
      case 'pi':
        result = Math.PI
        operationText = 'π'
        break

      // Euler number
      case 'e':
        result = Math.E
        operationText = 'e'
        break

      // Absolute value
      case 'abs':
        result = Math.abs(value)
        operationText = `|${value}|`
        break

      // Floor
      case 'floor':
        result = Math.floor(value)
        operationText = `floor(${value})`
        break

      // Ceiling
      case 'ceil':
        result = Math.ceil(value)
        operationText = `ceil(${value})`
        break

      default:
        return
    }

    if (!Number.isFinite(result)) {
      setDisplay('Error')

      setExpression(
        `${operationText} = Error`,
      )

      addToHistory(
        operationText,
        'Error',
      )

      setWaitingForOperand(true)
      return
    }

    const resultText =
      formatNumber(result)

    setDisplay(resultText)

    setExpression(
      `${operationText} = ${resultText}`,
    )

    addToHistory(
      operationText,
      resultText,
    )

    setWaitingForOperand(true)
  }

  // --------------------------------
  // Scientific notation
  // --------------------------------

  const enterExponent = () => {
    const value = Number(display)

    if (!Number.isFinite(value)) {
      return
    }

    const resultText =
      value.toExponential(6)

    setDisplay(resultText)
    setExpression(resultText)
  }

  // --------------------------------
  // Memory functions
  // --------------------------------

  const memoryClear = () => {
    setMemory(0)
  }

  const memoryRecall = () => {
    const memoryText =
      formatNumber(memory)

    setDisplay(memoryText)
    setExpression(memoryText)
    setWaitingForOperand(true)
  }

  const memoryAdd = () => {
    const value = Number(display)

    if (Number.isFinite(value)) {
      setMemory(
        (current) => current + value,
      )
    }
  }

  const memorySubtract = () => {
    const value = Number(display)

    if (Number.isFinite(value)) {
      setMemory(
        (current) => current - value,
      )
    }
  }

  const memoryStore = () => {
    const value = Number(display)

    if (Number.isFinite(value)) {
      setMemory(value)
    }
  }

  // --------------------------------
  // History
  // --------------------------------

  const clearHistory = () => {
    setHistory([])
  }

  const useHistoryResult = (
    result: string,
  ) => {
    setDisplay(result)
    setExpression(result)
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(true)
  }

  // --------------------------------
  // Keyboard
  // --------------------------------

  useEffect(() => {
    const handleKeyboard = (
      event: KeyboardEvent,
    ) => {
      const key = event.key

      if (/^[0-9]$/.test(key)) {
        inputDigit(key)
        return
      }

      if (key === '.') {
        inputDecimal()
        return
      }

      if (
        key === '+' ||
        key === '-' ||
        key === '*' ||
        key === '/' ||
        key === '^'
      ) {
        const mappedOperator =
          key === '*'
            ? '×'
            : key === '/'
              ? '÷'
              : key

        chooseOperator(mappedOperator)
        return
      }

      if (key === '%') {
        percentage()
        return
      }

      if (
        key === 'Enter' ||
        key === '='
      ) {
        handleEquals()
        return
      }

      if (
        key === 'Backspace' ||
        key === 'Delete'
      ) {
        deleteLast()
        return
      }

      if (key === 'Escape') {
        clearCalculator()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyboard,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyboard,
      )
    }
  })

  // --------------------------------
  // Button styles
  // --------------------------------

  const buttonClass =
    'flex min-h-12 items-center justify-center rounded-xl border border-white/5 bg-white/[0.05] text-sm font-medium text-slate-200 transition hover:bg-white/10 active:scale-95'

  const operatorClass =
    'flex min-h-12 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/25 active:scale-95'

  const scientificClass =
    'flex min-h-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] text-xs font-medium text-slate-300 transition hover:bg-white/10 active:scale-95'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">

      <div className="my-4 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] shadow-2xl shadow-black/50">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              <CalculatorIcon size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Calculator
              </p>

              <p className="text-xs text-slate-500">
                Study tools
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close calculator"
          >
            <X size={18} />
          </button>

        </div>

        {/* Modes */}
        <div className="flex shrink-0 gap-1 border-b border-white/10 bg-black/10 p-2">

          <button
            type="button"
            onClick={() => setMode('normal')}
            className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition ${
              mode === 'normal'
                ? 'bg-white text-slate-950'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Normal
          </button>

          <button
            type="button"
            onClick={() =>
              setMode('scientific')
            }
            className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition ${
              mode === 'scientific'
                ? 'bg-white text-slate-950'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            Scientific
          </button>

          <button
            type="button"
            onClick={() => setMode('gate')}
            className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition ${
              mode === 'gate'
                ? 'bg-white text-slate-950'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            GATE
          </button>

        </div>

        {/* Main */}
        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_300px]">

          {/* Calculator */}
          <div className="min-w-0 overflow-y-auto">

            <div className="p-4">

              {/* Display */}
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">

                <div className="min-h-7 overflow-x-auto whitespace-nowrap text-right font-mono text-sm text-slate-500">
                  {expression || ' '}
                </div>

                <div
                  className={`mt-2 min-h-12 break-all text-right font-mono font-semibold ${
                    display.length > 14
                      ? 'text-2xl'
                      : display.length > 9
                        ? 'text-3xl'
                        : 'text-4xl'
                  } ${
                    display === 'Error'
                      ? 'text-red-400'
                      : 'text-white'
                  }`}
                >
                  {display}
                </div>

              </div>

              {/* Scientific + GATE controls */}
              {(mode === 'scientific' ||
                mode === 'gate') && (
                <>

                  {/* Functions */}
                  <div className="mt-3 grid grid-cols-4 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'sin',
                        )
                      }
                      className={scientificClass}
                    >
                      sin
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'cos',
                        )
                      }
                      className={scientificClass}
                    >
                      cos
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'tan',
                        )
                      }
                      className={scientificClass}
                    >
                      tan
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'sqrt',
                        )
                      }
                      className={scientificClass}
                    >
                      √x
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'asin',
                        )
                      }
                      className={scientificClass}
                    >
                      sin⁻¹
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'acos',
                        )
                      }
                      className={scientificClass}
                    >
                      cos⁻¹
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'atan',
                        )
                      }
                      className={scientificClass}
                    >
                      tan⁻¹
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'square',
                        )
                      }
                      className={scientificClass}
                    >
                      x²
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        chooseOperator('^')
                      }
                      className={scientificClass}
                    >
                      xʸ
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'reciprocal',
                        )
                      }
                      className={scientificClass}
                    >
                      1/x
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'log',
                        )
                      }
                      className={scientificClass}
                    >
                      log
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'ln',
                        )
                      }
                      className={scientificClass}
                    >
                      ln
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'exp',
                        )
                      }
                      className={scientificClass}
                    >
                      eˣ
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'pow10',
                        )
                      }
                      className={scientificClass}
                    >
                      10ˣ
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'factorial',
                        )
                      }
                      className={scientificClass}
                    >
                      n!
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'abs',
                        )
                      }
                      className={scientificClass}
                    >
                      |x|
                    </button>

                  </div>

                  {/* Constants / utility */}
                  <div className="mt-2 grid grid-cols-4 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation(
                          'pi',
                        )
                      }
                      className={scientificClass}
                    >
                      π
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        scientificOperation('e')
                      }
                      className={scientificClass}
                    >
                      e
                    </button>

                    <button
                      type="button"
                      onClick={enterExponent}
                      className={scientificClass}
                    >
                      EXP
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleSign()
                      }
                      className={scientificClass}
                    >
                      ±
                    </button>

                  </div>

                  {/* Memory */}
                  <div className="mt-2 grid grid-cols-5 gap-2">

                    <button
                      type="button"
                      onClick={memoryClear}
                      className={scientificClass}
                    >
                      MC
                    </button>

                    <button
                      type="button"
                      onClick={memoryRecall}
                      className={scientificClass}
                    >
                      MR
                    </button>

                    <button
                      type="button"
                      onClick={memoryAdd}
                      className={scientificClass}
                    >
                      M+
                    </button>

                    <button
                      type="button"
                      onClick={memorySubtract}
                      className={scientificClass}
                    >
                      M−
                    </button>

                    <button
                      type="button"
                      onClick={memoryStore}
                      className={scientificClass}
                    >
                      MS
                    </button>

                  </div>

                </>
              )}

              {/* GATE information */}
              {mode === 'gate' && (
                <div className="mt-3 rounded-xl border border-violet-500/15 bg-violet-500/5 px-3 py-2">

                  <p className="text-xs font-medium text-violet-300">
                    GATE-style engineering calculator
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    Includes scientific functions,
                    powers, roots, logarithms,
                    trigonometry, factorial,
                    constants, memory and
                    scientific notation.
                  </p>

                </div>
              )}

              {/* Basic keypad */}
              <div className="mt-3 grid grid-cols-4 gap-2">

                {/* Row 1 */}
                <button
                  type="button"
                  onClick={clearCalculator}
                  className="flex min-h-12 items-center justify-center rounded-xl bg-red-500/10 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 active:scale-95"
                >
                  AC
                </button>

                <button
                  type="button"
                  onClick={deleteLast}
                  className={buttonClass}
                >
                  <Delete size={17} />
                </button>

                <button
                  type="button"
                  onClick={percentage}
                  className={buttonClass}
                >
                  %
                </button>

                <button
                  type="button"
                  onClick={() =>
                    chooseOperator('÷')
                  }
                  className={operatorClass}
                >
                  ÷
                </button>

                {/* Row 2 */}
                <button
                  type="button"
                  onClick={() => inputDigit('7')}
                  className={buttonClass}
                >
                  7
                </button>

                <button
                  type="button"
                  onClick={() => inputDigit('8')}
                  className={buttonClass}
                >
                  8
                </button>

                <button
                  type="button"
                  onClick={() => inputDigit('9')}
                  className={buttonClass}
                >
                  9
                </button>

                <button
                  type="button"
                  onClick={() =>
                    chooseOperator('×')
                  }
                  className={operatorClass}
                >
                  ×
                </button>

                {/* Row 3 */}
                <button
                  type="button"
                  onClick={() => inputDigit('4')}
                  className={buttonClass}
                >
                  4
                </button>

                <button
                  type="button"
                  onClick={() => inputDigit('5')}
                  className={buttonClass}
                >
                  5
                </button>

                <button
                  type="button"
                  onClick={() => inputDigit('6')}
                  className={buttonClass}
                >
                  6
                </button>

                <button
                  type="button"
                  onClick={() =>
                    chooseOperator('-')
                  }
                  className={operatorClass}
                >
                  <Minus size={17} />
                </button>

                {/* Row 4 */}
                <button
                  type="button"
                  onClick={() => inputDigit('1')}
                  className={buttonClass}
                >
                  1
                </button>

                <button
                  type="button"
                  onClick={() => inputDigit('2')}
                  className={buttonClass}
                >
                  2
                </button>

                <button
                  type="button"
                  onClick={() => inputDigit('3')}
                  className={buttonClass}
                >
                  3
                </button>

                <button
                  type="button"
                  onClick={() =>
                    chooseOperator('+')
                  }
                  className={operatorClass}
                >
                  <Plus size={17} />
                </button>

                {/* Row 5 */}
                <button
                  type="button"
                  onClick={() => inputDigit('0')}
                  className={`${buttonClass} col-span-2`}
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={inputDecimal}
                  className={buttonClass}
                >
                  .
                </button>

                <button
                  type="button"
                  onClick={handleEquals}
                  className="flex min-h-12 items-center justify-center rounded-xl bg-violet-500 text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 active:scale-95"
                >
                  <Equal size={18} />
                </button>

              </div>

              <p className="mt-3 text-center text-[11px] text-slate-600">
                Keyboard supported · Enter = calculate ·
                Esc = clear
              </p>

            </div>

          </div>

          {/* History */}
          <div className="min-h-0 border-t border-white/10 bg-black/10 md:border-l md:border-t-0">

            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">

              <div className="flex items-center gap-2">
        
                <History
                  size={16}
                  className="text-violet-400"
                />

                <div>
                  <p className="text-sm font-semibold text-white">
                    History
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Last 10 calculations
                  </p>
                </div>

              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[11px] font-medium text-slate-500 transition hover:text-red-300"
                >
                  Clear
                </button>
              )}

            </div>

            <div className="max-h-[500px] overflow-y-auto p-3">

              {history.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center text-center">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-600">
                    <History size={20} />
                  </div>

                  <p className="mt-3 text-sm text-slate-400">
                    No calculations yet
                  </p>

                  <p className="mt-1 max-w-[190px] text-xs leading-relaxed text-slate-600">
                    Your last 10 calculations
                    will appear here.
                  </p>

                </div>
              ) : (
                <div className="space-y-2">

                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        useHistoryResult(
                          item.result,
                        )
                      }
                      className="w-full rounded-xl border border-white/5 bg-white/[0.03] p-3 text-left transition hover:border-violet-500/20 hover:bg-violet-500/[0.06]"
                    >

                      <p className="truncate font-mono text-xs text-slate-500">
                        {item.expression}
                      </p>

                      <p className="mt-1 truncate font-mono text-base font-semibold text-white">
                        = {item.result}
                      </p>

                    </button>
                  ))}

                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Calculator