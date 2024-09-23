const leadService = require('../service/leadService');
const leadId = require('../utils/token');
const generateId=require('../utils/token')
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const dataSource = require('../infrastructure/psql');
const otherDetail = require('../entities/otherDetail');
const followUp = require('../entities/followUp');

// const toPascalCase = (str) => {
//     return str
//       .replace(/\s(.)/g, function (match, group1) {
//         return group1.toUpperCase();
//       })
//       .replace(/^(.)/, function (match, group1) {
//         return group1.toUpperCase();
//       })
//       .replace(/\s+/g, ''); 
//   };
  
//   const convertKeysToPascalCase = (data) => {
//     const result = {};
//     for (const key in data) {
//       if (data.hasOwnProperty(key)) {
//         const pascalCaseKey = toPascalCase(key);
//           result[pascalCaseKey] = data[key];
//       }
//     }
//     return result;
//   };
  
const isPascalCase = (str) => {
  return /^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/.test(str); // Matches only PascalCase format
};

const toPascalCase = (str) => {
  if (isPascalCase(str)) {
    return str;
  }
  const words = str.match(/[A-Za-z][a-z]*/g) || []; 

  const pascalCaseStr = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(''); 

  // Special cases for customer feedback
  if (['customer', 'feedback', 'customerfeedback', 'feedbackcustomer'].includes(pascalCaseStr.toLowerCase())) {
    return 'CustomerFeedBack'; 
  }

  return pascalCaseStr;
};

const convertKeysToPascalCase = (data) => {
  const result = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const pascalCaseKey = toPascalCase(key);
      result[pascalCaseKey] = data[key];
    }
  }
  return result;
};


const leadController = {
    createLead: async (io,req, res) => {
        try {
            const data = req.body;
            data.leadId = leadId();
            const user = req.user;
            if (data.CustomerFeedBack === 'followUp' && !data.FollowUpDetail) {
                return res.status(400).json({ message: 'followUpDetail is required when customer_feedBack is followUp' });
            }
            if (data.CustomerFeedBack === 'other' && !data.otherDetail) {
                return res.status(400).json({ message: 'other is required when customer_feedBack is other' });
            }
            const lead = await leadService.leadCreateService(data, user);
           if(lead){
            io.emit('send_message', lead);

            res.status(201).json({ message: 'Lead created successfully', lead });
           }
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },

    readLead: async (io, req, res) => {
        try {
          const data = await leadService.leadReadService();
      
          if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Data Not Found' });
          }
      
          const processedData = data.map(lead => {
            const { dynamicLead = {}, ...otherDetails } = lead;
            const mergedLead = {
              ...dynamicLead, 
              ...otherDetails, 
            };
      
            if (mergedLead.customer_feedBack !== 'followUp') {
              delete mergedLead.followUpDetail;
            }
            if (mergedLead.customer_feedBack !== 'other') {
              delete mergedLead.otherDetail;
            }
            if (mergedLead.role === 'admin') {
              delete mergedLead.agentId;
            }
      
            return mergedLead; 
          });
      
          io.emit('receive_message', processedData);
                res.status(200).json({ message: 'Success', data: processedData });
        } catch (error) {
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
      },
      
      updateLead: async (io, req, res) => {
        try {
          
          const data = req.body;
            const leadId = req.params.leadId;
            const user = req.user;
    
    
            const lead = await leadService.updateLeadByService({ data, leadId, user });
        const formattedLead = {
          ...lead.dynamicLead,
       
      };

              console.log("lead.CustomerFeedBack",formattedLead.CustomerFeedBack)
            if (formattedLead && formattedLead.CustomerFeedBack !== 'followUp') {
                delete formattedLead.FollowUpDetail;
            }
            if (formattedLead && formattedLead.CustomerFeedBack !== 'other') {
                delete formattedLead.otherDetail;
            }
            
            io.emit('receive_message', lead);
            res.status(201).json({ message: 'Lead Updated successfully', data: formattedLead });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },
    
     saveExcelFileData :async (io, req, res) => {
        if (!req.file) {
          return res.status(400).json({ message: 'Please upload an Excel file.' });
        }
      
        const filePath = path.join(__dirname, '../uploads/', req.file.filename);
      
        try {
          const workbook = xlsx.readFile(filePath);
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const results = xlsx.utils.sheet_to_json(sheet);

      
          if (results.length === 0) {
            return res.status(400).json({ message: 'No data found in the Excel file.' });
          }
      
          const leadCreate = [];
          for (const row of results) {
            const convertedRow = convertKeysToPascalCase(row);
            const leadData = {
              ...convertedRow,
              PhoneNumber: convertedRow.PhoneNumber ? String(convertedRow.PhoneNumber) : undefined,
              leadId: generateId()

            };
    
            console.log("Lead Data:", leadData);
      
            const assignedLead = await leadService.leadCreateService(leadData, req.user);
            leadCreate.push(assignedLead);
          }

      
          if (leadCreate.length > 0) {
            io.emit('send_message', leadCreate);
            return res.status(200).json({ message: 'Leads created successfully', data: leadCreate });
          } else {
            return res.status(400).json({ message: 'No leads were created due to missing data or errors.' });
          }
        } catch (error) {
          console.error('Error processing the Excel file:', error);
          return res.status(500).json({ message: 'Internal Server Error', error: error.message });
        } finally {
          fs.unlinkSync(filePath); 
        }
      },
      
      

      getLeadById: async (req, res) => {
        try {
            const leadId = req.params.leadId;
            const data = await leadService.leadGetServiceById(leadId);
            console.log("Data", data);
    
            if (data) {
                const processedData = ((lead) => {
                    const { dynamicLead = {}, ...otherDetails } = lead;
                    const mergedLead = {
                        ...dynamicLead,
                        ...otherDetails,
                    };
    
                    if (mergedLead.CustomerFeedBack !== 'followUp') {
                        delete mergedLead.FollowUpDetail;
                    }
                    if (mergedLead.CustomerFeedBack !== 'other') {
                        delete mergedLead.OtherDetail;
                    }
    
                    return mergedLead;
                })(data);  // Immediately invoke the processing function with 'data'
    
                res.status(200).send({ message: "success", data: processedData });
            } else {
                res.status(200).send({ message: "Data Not Found" });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },
    
    getallSpecificLeadByAgentId: async (req, res) => {
        try {
          const agentId = req.params.agentId;
          const data = await leadService.leadAllGetServiceByAgentId(agentId);
      
          if (data && data.length > 0) {
            const processedData = data.map(lead => {
              const { dynamicLead = {}, ...otherDetails } = lead;
              const mergedLead = {
                ...dynamicLead, 
                ...otherDetails, 
              };
                    if (mergedLead.customer_feedBack !== 'followUp') {
                delete mergedLead.followUpDetail;
              }
              if (mergedLead.customer_feedBack !== 'other') {
                delete mergedLead.otherDetail;
              }
      
              return mergedLead; 
            });
                  res.status(200).send({ message: "success", data: processedData });
          } else {
            res.status(404).send({ message: `No leads found for agentId ${agentId}` });
          }
        } catch (error) {
          console.error('Error fetching leads:', error);
          res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
      },
      
    
    deleteLead: async (req, res) => {
        try {
            const leadId = req.params.leadId;
            console.log("leadId in params",leadId)
            const user = req.user;
            const result = await leadService.deleteLeadById(leadId, user);
            if (!result) {
                return res.status(404).json({ message: 'Lead Data not found' });
            }
            res.status(200).json({ message: 'Lead Data deleted successfully', data: result });
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};

module.exports = { leadController };
