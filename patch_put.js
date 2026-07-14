const fs = require('fs');
const file = 'src/app/api/admin/rentals/route.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `    const data = await request.json() as any;
    const { id, ...updateFields } = data;`,
  `    const contentType = request.headers.get('content-type') || '';
    let data: any = {};
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      
      // Parse array fields that were sent as multiple FormData entries
      const equipment = formData.getAll('equipment');
      if (equipment.length > 0) data.equipment = equipment;
      
      const features = formData.getAll('features');
      if (features.length > 0) data.features = features;
      
      const transportation = formData.getAll('transportation');
      if (transportation.length > 0) data.transportation = transportation;

      // Handle contractFile upload
      const contractFile = formData.get('contractFile') as File | null;
      if (contractFile && contractFile.size > 0) {
        const ext = contractFile.name.split('.').pop();
        const contractFilename = \`\${data.id}.\${ext}\`;
        const arrayBuffer = await contractFile.arrayBuffer();
        // @ts-ignore
        await env.R2_CONTRACTS.put(contractFilename, arrayBuffer, {
          httpMetadata: { contentType: contractFile.type }
        });
        data.contractFile = contractFilename;
      } else {
        delete data.contractFile; // Don't update if no new file
      }
    } else {
      data = await request.json();
    }
    const { id, ...updateFields } = data;`
);

// We need to add verificationStatus to allowedKeys in PUT
code = code.replace(
  `      'badLandlord', 'evidenceLink'`,
  `      'badLandlord', 'evidenceLink', 'verificationStatus', 'contractFile'`
);

fs.writeFileSync(file, code);
