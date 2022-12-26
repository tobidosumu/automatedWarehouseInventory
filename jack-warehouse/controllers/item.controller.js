const itemController = {
    createitem: async (req, res) => {
      console.log(req.body.price);
      res.status(200).json({ status: "item added successfully" });
    },
  
    updateitem: async (req, res) => {
      res.status(200).json({ status: "item updated successfully" });
    },
  
    getallitem: async (req, res) => {
      res.status(200).json({ status: "Inventories retrieved successfully" });
    },
  
    getbyIditem: async (req, res) => {
      res.status(200).json({ status: "item retrieved by id successfully" });
    },
  
    deleteitem: async (req, res) => {
      res.status(200).json({ status: "item deleted" });
    },
  };
  
  module.exports = itemController;
  