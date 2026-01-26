/**
 * Student ID Generator
 * Generates random 6-digit alphanumeric student IDs
 */

export class StudentIdGenerator {
  private static readonly CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  private static readonly ID_LENGTH = 6;

  /**
   * Generate a random 6-digit alphanumeric student ID
   * Format: ABC123, XYZ789, etc.
   * @returns string - Random 6-character student ID
   */
  static generateStudentId(): string {
    let result = '';
    for (let i = 0; i < this.ID_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * this.CHARACTERS.length);
      result += this.CHARACTERS[randomIndex];
    }
    return result;
  }

  /**
   * Generate a unique student ID that doesn't exist in database
   * @param existingIds - Array of existing student IDs to avoid duplicates
   * @returns string - Unique 6-character student ID
   */
  static generateUniqueStudentId(existingIds: string[]): string {
    let newId: string;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop

    do {
      newId = this.generateStudentId();
      attempts++;
      
      if (attempts > maxAttempts) {
        // Fallback: add timestamp suffix if too many collisions
        const timestamp = Date.now().toString().slice(-3);
        newId = this.generateStudentId().slice(0, 3) + timestamp;
        break;
      }
    } while (existingIds.includes(newId));

    return newId;
  }

  /**
   * Validate student ID format
   * @param studentId - Student ID to validate
   * @returns boolean - True if valid format
   */
  static isValidStudentId(studentId: string): boolean {
    if (!studentId || studentId.length !== this.ID_LENGTH) {
      return false;
    }

    // Check if all characters are alphanumeric (A-Z, 0-9)
    const regex = /^[A-Z0-9]{6}$/;
    return regex.test(studentId);
  }

  /**
   * Generate multiple unique student IDs
   * @param count - Number of IDs to generate
   * @param existingIds - Array of existing student IDs to avoid duplicates
   * @returns string[] - Array of unique student IDs
   */
  static generateMultipleUniqueIds(count: number, existingIds: string[] = []): string[] {
    const generatedIds: string[] = [];
    const allExistingIds = [...existingIds];

    for (let i = 0; i < count; i++) {
      const newId = this.generateUniqueStudentId(allExistingIds);
      generatedIds.push(newId);
      allExistingIds.push(newId); // Add to existing list to avoid duplicates in this batch
    }

    return generatedIds;
  }
}