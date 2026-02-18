import '@metaplex-foundation/js';

declare module '@metaplex-foundation/js' {
  interface CreateNftInput {
    description?: string;  
  }
  
  interface Nft {
    description?: string;
  }

}