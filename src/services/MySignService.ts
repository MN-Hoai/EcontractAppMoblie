import { NativeModules } from 'react-native';

const { MySignModule } = NativeModules;

export interface MySignResponse {
  status: 'SUCCESS' | 'ERROR';
  message?: string;
}

/**
 * Service to interact with the Viettel MySign SDK via Native Module Bridge.
 */
class MySignService {
  /**
   * Registers the device with the MySign SDK using a registration token.
   * 
   * @param token THE registration token provided by the backend.
   * @returns Promise resolving to "SUCCESS" or rejecting with error.
   */
  static async registerDevice(token: string): Promise<string> {
    try {
      if (!MySignModule) {
        throw new Error('MySignModule is not available. Ensure native integration is correct and app is rebuilt.');
      }
      return await MySignModule.registerDevice(token);
    } catch (error: any) {
      console.error('[MySignService] registerDevice Error:', error);
      throw error;
    }
  }
}

export default MySignService;
