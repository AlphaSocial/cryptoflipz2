class StorageService {
  constructor() {
    this.prefix = 'crypto-flipz-';
  }

  setItem(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getItem(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  // Flip-specific methods
  saveFlip(flip) {
    const flips = this.getFlips();
    flips.push(flip);
    this.setItem('flips', flips);
  }

  getFlips() {
    return this.getItem('flips') || [];
  }

  updateFlip(flipId, updates) {
    const flips = this.getFlips();
    const index = flips.findIndex(f => f.id === flipId);
    if (index !== -1) {
      flips[index] = { ...flips[index], ...updates };
      this.setItem('flips', flips);
    }
  }

  getFlipById(flipId) {
    const flips = this.getFlips();
    return flips.find(f => f.id === flipId);
  }
}

export const storage = new StorageService(); 