/**
 * Roman Numeral Converter
 * Converts numbers to Roman numerals for certificate formatting
 */

export class RomanNumeralConverter {
  private static readonly ROMAN_NUMERALS = [
    { value: 1000, numeral: 'M' },
    { value: 900, numeral: 'CM' },
    { value: 500, numeral: 'D' },
    { value: 400, numeral: 'CD' },
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];

  /**
   * Convert a number to Roman numeral
   * @param num - Number to convert (1-3999)
   * @returns string - Roman numeral representation
   */
  static toRoman(num: number): string {
    if (num <= 0 || num >= 4000) {
      throw new Error('Number must be between 1 and 3999');
    }

    let result = '';
    let remaining = num;

    for (const { value, numeral } of this.ROMAN_NUMERALS) {
      const count = Math.floor(remaining / value);
      if (count > 0) {
        result += numeral.repeat(count);
        remaining -= value * count;
      }
    }

    return result;
  }

  /**
   * Convert month number to Roman numeral
   * @param month - Month number (1-12)
   * @returns string - Roman numeral for month
   */
  static monthToRoman(month: number): string {
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }
    return this.toRoman(month);
  }

  /**
   * Get current month in Roman numeral
   * @returns string - Current month as Roman numeral
   */
  static getCurrentMonthRoman(): string {
    const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
    return this.monthToRoman(currentMonth);
  }

  /**
   * Get current year
   * @returns number - Current year
   */
  static getCurrentYear(): number {
    return new Date().getFullYear();
  }

  /**
   * Get formatted month/year for certificates (e.g., "VIII/2026")
   * @returns string - Formatted month/year
   */
  static getCurrentMonthYearRoman(): string {
    const monthRoman = this.getCurrentMonthRoman();
    const year = this.getCurrentYear();
    return `${monthRoman}/${year}`;
  }

  /**
   * Get formatted month/year for specific date
   * @param date - Date object
   * @returns string - Formatted month/year
   */
  static getMonthYearRoman(date: Date): string {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const monthRoman = this.monthToRoman(month);
    return `${monthRoman}/${year}`;
  }
}