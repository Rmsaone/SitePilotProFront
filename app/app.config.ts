export default defineAppConfig({
  // Issuer printed on quotes and invoices.
  company: {
    name: 'SitePilotPro',
    street: '12 avenue des Bâtisseurs',
    city: '75008 Paris, France',
    email: 'contact@sitepilotpro.fr',
    phone: '+33 1 23 45 67 89',
    siret: '123 456 789 00012',
    tvaIntra: 'FR12345678901'
  },
  ui: {
    colors: {
      primary: 'primarySite',
      secondary: 'secondarySite',
      tertiary: 'tertiarySite'
    }
  }
});
