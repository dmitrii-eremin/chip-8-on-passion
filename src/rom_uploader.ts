export class RomUploader {
  /**
   * Shows a file upload dialog and returns the uploaded file as an array of bytes
   * @returns Promise<number[] | undefined> - Array of bytes if successful, undefined if cancelled or failed
   */
  public async upload(): Promise<number[] | undefined> {
    return new Promise((resolve) => {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.ch8'; // Accept .ch8 files, but browser will still allow "All files" option
      input.style.display = 'none';
      
      // Handle file selection
      input.addEventListener('change', async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          resolve(undefined);
          return;
        }
        
        try {
          let arrayBuffer = await file.arrayBuffer();
        // Ensure even byte length for 16-bit processing
        if (arrayBuffer.byteLength % 2 !== 0) {
            const paddedBuffer = new ArrayBuffer(arrayBuffer.byteLength + 1);
            const originalView = new Uint8Array(arrayBuffer);
            const paddedView = new Uint8Array(paddedBuffer);
            paddedView.set(originalView);
            paddedView[arrayBuffer.byteLength] = 0;
            arrayBuffer = paddedBuffer;
        }
          const uint16Array = new Uint16Array(arrayBuffer);
          const swappedBytes = Array.from(uint16Array).map(value => 
            ((value & 0xFF) << 8) | ((value >> 8) & 0xFF)
          );
          
          resolve(swappedBytes);
        } catch (error) {
          console.error('Error reading file:', error);
          resolve(undefined);
        } finally {
          // Clean up
          document.body.removeChild(input);
        }
      });
      
      // Handle dialog cancellation
      input.addEventListener('cancel', () => {
        document.body.removeChild(input);
        resolve(undefined);
      });
      
      // Add to DOM and trigger click
      document.body.appendChild(input);
      input.click();
    });
  }
}
