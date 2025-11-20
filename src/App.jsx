import React, { useState, useEffect, useRef, useCallback } from 'react';

const RemodelingEstimator = () => {
  // State for project info
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  
  // State for room dimensions
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Living Room', length: 0, width: 0, height: 0 }
  ]);
  
  // State for materials
  const [materials, setMaterials] = useState([
    { id: 1, name: 'Drywall', unit: 'sqft', unitCost: 1.5, quantity: 0, total: 0, supplier: 'ABC Supply' },
    { id: 2, name: 'Paint', unit: 'gallon', unitCost: 35, quantity: 0, total: 0, supplier: 'ABC Supply' },
    { id: 3, name: 'Flooring', unit: 'sqft', unitCost: 3.75, quantity: 0, total: 0, supplier: 'ABC Supply' }
  ]);
  
  // Material database from suppliers
  const [materialDatabase, setMaterialDatabase] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for labor
  const [labor, setLabor] = useState([
    { id: 1, description: 'Demolition', hours: 0, rate: 45, total: 0 },
    { id: 2, description: 'Installation', hours: 0, rate: 65, total: 0 },
    { id: 3, description: 'Finishing', hours: 0, rate: 55, total: 0 }
  ]);

  // State for supplier API connections
  const [supplierApiStatus, setSupplierApiStatus] = useState({
    abcSupply: { connected: false, loading: false, error: null },
    beaconRoofing: { connected: false, loading: false, error: null }
  });
  const [liveInventoryData, setLiveInventoryData] = useState({});
  const [liveLocationInfo, setLiveLocationInfo] = useState({
    zipCode: '',
    locations: []
  });
  const [isCheckingInventory, setIsCheckingInventory] = useState(false);
  
  // Ref for the file input
  const fileInputRef = useRef(null);
  const [uploadedPlans, setUploadedPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Mock API Services (in a real app, these would be actual API clients)
  const abcSupplyApi = useRef(null);
  const beaconRoofingApi = useRef(null);

  // Add new room
  const addRoom = () => {
    const newId = rooms.length > 0 ? Math.max(...rooms.map(room => room.id)) + 1 : 1;
    setRooms([...rooms, { id: newId, name: 'New Room', length: 0, width: 0, height: 0 }]);
  };

  // Add new material
  const addMaterial = () => {
    const newId = materials.length > 0 ? Math.max(...materials.map(item => item.id)) + 1 : 1;
    setMaterials([...materials, { id: newId, name: '', unit: 'sqft', unitCost: 0, quantity: 0, total: 0, supplier: 'ABC Supply' }]);
  };
  
  // Add material from database
  const addMaterialFromDatabase = (item) => {
    const newId = materials.length > 0 ? Math.max(...materials.map(mat => mat.id)) + 1 : 1;
    setMaterials([...materials, { 
      id: newId, 
      name: item.name, 
      unit: item.unit, 
      unitCost: item.price, 
      quantity: 0, 
      total: 0,
      supplier: item.supplier,
      sku: item.sku
    }]);
  };

  // Connect to ABC Supply API
  const connectToAbcSupply = useCallback(async () => {
    setSupplierApiStatus(prev => ({
      ...prev,
      abcSupply: { ...prev.abcSupply, loading: true, error: null }
    }));
    
    try {
      // In a real implementation, we would initialize the actual API client
      // For demo purposes, we'll simulate the API connection
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      abcSupplyApi.current = {
        // Mock implementation of the API client
        searchMaterials: async (query, category) => {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const mockProducts = [
            { sku: "ABC-DW-12", name: "1/2\" Drywall", category: "Drywall", price: 12.58, unit: "sheet", inStock: true },
            { sku: "ABC-DW-58FR", name: "5/8\" Drywall - Fire Rated", category: "Drywall", price: 15.25, unit: "sheet", inStock: true },
            { sku: "ABC-DJC-5GL", name: "Drywall Joint Compound", category: "Drywall", price: 18.99, unit: "bucket", inStock: true },
            { sku: "ABC-RF-THDZ", name: "GAF Timberline HDZ Shingles", category: "Roofing", price: 38.25, unit: "bundle", inStock: true },
            { sku: "ABC-RF-THDZ-BLK", name: "GAF Timberline HDZ Shingles - Black", category: "Roofing", price: 38.75, unit: "bundle", inStock: false },
            { sku: "ABC-SD-VNLW", name: "Vinyl Siding - White", category: "Siding", price: 115.75, unit: "square", inStock: true },
            { sku: "ABC-INS-R19", name: "R-19 Insulation", category: "Insulation", price: 49.88, unit: "roll", inStock: true },
            { sku: "ABC-TR-PIT", name: "Primed Interior Trim", category: "Trim", price: 1.25, unit: "linear ft", inStock: true },
          ];
          
          let results = mockProducts;
          
          if (query) {
            query = query.toLowerCase();
            results = results.filter(product =>
              product.name.toLowerCase().includes(query) ||
              product.sku.toLowerCase().includes(query)
            );
          }
          
          if (category && category !== "All") {
            results = results.filter(product => product.category === category);
          }
          
          return results;
        },
        
        checkInventory: async (skus, zipCode) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const inventory = {};
          
          skus.forEach(sku => {
            // Random inventory data
            const available = Math.random() > 0.2; // 20% chance of being out of stock
            const quantity = available ? Math.floor(Math.random() * 100) + 1 : 0;
            
            inventory[sku] = {
              available: available,
              quantity: quantity,
              locations: available ? [
                {
                  id: "ABC-WH-001",
                  name: "ABC Supply - Main Warehouse",
                  distance: Math.floor(Math.random() * 20) + 1,
                  quantity: quantity
                },
                {
                  id: "ABC-DT-002",
                  name: "ABC Supply - Downtown",
                  distance: Math.floor(Math.random() * 10) + 20,
                  quantity: Math.floor(quantity / 2)
                }
              ] : []
            };
          });
          
          return inventory;
        }
      };
      
      setSupplierApiStatus(prev => ({
        ...prev,
        abcSupply: { connected: true, loading: false, error: null }
      }));
    } catch (error) {
      setSupplierApiStatus(prev => ({
        ...prev,
        abcSupply: { connected: false, loading: false, error: error.message || "Failed to connect" }
      }));
    }
  }, []);
  
  // Connect to Beacon Roofing API
  const connectToBeaconRoofing = useCallback(async () => {
    setSupplierApiStatus(prev => ({
      ...prev,
      beaconRoofing: { ...prev.beaconRoofing, loading: true, error: null }
    }));
    
    try {
      // In a real implementation, we would initialize the actual API client
      // For demo purposes, we'll simulate the API connection
      await new Promise(resolve => setTimeout(resolve, 1800)); // Simulate network delay
      
      beaconRoofingApi.current = {
        // Mock implementation of the API client
        searchProducts: async (query, category) => {
          await new Promise(resolve => setTimeout(resolve, 600));
          
          const mockProducts = [
            { sku: "BCN-1001", name: "GAF Timberline HDZ Shingles", category: "Shingles", price: 37.50, unit: "bundle", stock: "In Stock" },
            { sku: "BCN-1002", name: "Owens Corning Duration Shingles", category: "Shingles", price: 35.75, unit: "bundle", stock: "In Stock" },
            { sku: "BCN-1003", name: "CertainTeed Landmark Shingles", category: "Shingles", price: 36.25, unit: "bundle", stock: "Limited Stock" },
            { sku: "BCN-2001", name: "Synthetic Underlayment", category: "Underlayment", price: 85.99, unit: "roll", stock: "In Stock" },
            { sku: "BCN-2002", name: "Ice & Water Shield", category: "Underlayment", price: 72.99, unit: "roll", stock: "In Stock" },
            { sku: "BCN-3001", name: "Ridge Vent", category: "Ventilation", price: 4.25, unit: "linear ft", stock: "In Stock" },
            { sku: "BCN-4001", name: "Roof Flashing", category: "Flashing", price: 8.50, unit: "piece", stock: "Low Stock" },
            { sku: "BCN-5001", name: "Roofing Nails", category: "Fasteners", price: 45.99, unit: "box", stock: "In Stock" },
          ];
          
          let results = mockProducts;
          
          if (query) {
            query = query.toLowerCase();
            results = results.filter(product => 
              product.name.toLowerCase().includes(query) ||
              product.sku.toLowerCase().includes(query)
            );
          }
          
          if (category && category !== "All") {
            results = results.filter(product => product.category === category);
          }
          
          return results;
        },
        
        checkAvailability: async (skus, zipCode) => {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const availability = {};
          
          skus.forEach(sku => {
            const available = Math.random() > 0.2;
            
            availability[sku] = {
              status: available ? "Available" : "Out of Stock",
              estimatedQuantity: available ? Math.floor(Math.random() * 200) : 0,
              locations: available ? [
                { id: "BCN-001", name: "Beacon Roofing - North", distance: "5.2 miles", quantity: Math.floor(Math.random() * 100) + 50 },
                { id: "BCN-002", name: "Beacon Roofing - South", distance: "12.1 miles", quantity: Math.floor(Math.random() * 100) }
              ] : []
            };
          });
          
          return availability;
        }
      };
      
      setSupplierApiStatus(prev => ({
        ...prev,
        beaconRoofing: { connected: true, loading: false, error: null }
      }));
    } catch (error) {
      setSupplierApiStatus(prev => ({
        ...prev,
        beaconRoofing: { connected: false, loading: false, error: error.message || "Failed to connect" }
      }));
    }
  }, []);

  // Update materials with live price and inventory data
  const updateWithLiveData = useCallback(() => {
    if (Object.keys(liveInventoryData).length === 0) {
      alert("Please check inventory first to get live data.");
      return;
    }
    
    setMaterials(prevMaterials => 
      prevMaterials.map(material => {
        if (material.sku && liveInventoryData[material.sku]) {
          const inventoryData = liveInventoryData[material.sku];
          
          // Get most relevant location's quantity
          let quantityAvailable = 0;
          if (inventoryData.locations && inventoryData.locations.length > 0) {
            // Sort by distance and take the first one
            const sortedLocations = [...inventoryData.locations].sort((a, b) => a.distance - b.distance);
            quantityAvailable = sortedLocations[0].quantity;
          }
          
          return {
            ...material,
            availableQuantity: quantityAvailable,
            inStock: quantityAvailable > 0
          };
        }
        return material;
      })
    );
  }, [liveInventoryData]);
  
  // Check inventory for selected materials
  const checkInventory = useCallback(async () => {
    if (!liveLocationInfo.zipCode) {
      alert("Please enter a ZIP code to check inventory.");
      return;
    }
    
    setIsCheckingInventory(true);
    
    try {
      const abcSupplyItems = materials.filter(item => item.supplier === 'ABC Supply' && item.sku);
      const beaconItems = materials.filter(item => item.supplier === 'Beacon Roofing' && item.sku);
      
      const inventoryData = { ...liveInventoryData };
      
      // Check ABC Supply inventory if connected and there are items
      if (supplierApiStatus.abcSupply.connected && abcSupplyItems.length > 0 && abcSupplyApi.current) {
        const abcSkus = abcSupplyItems.map(item => item.sku);
        const abcInventory = await abcSupplyApi.current.checkInventory(abcSkus, liveLocationInfo.zipCode);
        
        // Merge inventory data
        Object.keys(abcInventory).forEach(sku => {
          inventoryData[sku] = {
            ...abcInventory[sku],
            supplier: 'ABC Supply'
          };
        });
      }
      
      // Check Beacon Roofing inventory if connected and there are items
      if (supplierApiStatus.beaconRoofing.connected && beaconItems.length > 0 && beaconRoofingApi.current) {
        const beaconSkus = beaconItems.map(item => item.sku);
        const beaconInventory = await beaconRoofingApi.current.checkAvailability(beaconSkus, liveLocationInfo.zipCode);
        
        // Merge inventory data
        Object.keys(beaconInventory).forEach(sku => {
          inventoryData[sku] = {
            available: beaconInventory[sku].status === "Available",
            quantity: beaconInventory[sku].estimatedQuantity,
            locations: beaconInventory[sku].locations.map(loc => ({
              id: loc.id,
              name: loc.name,
              distance: parseFloat(loc.distance),
              quantity: loc.quantity
            })),
            supplier: 'Beacon Roofing'
          };
        });
      }
      
      setLiveInventoryData(inventoryData);
      
      // Combine all locations from all suppliers for the location selector
      const allLocations = new Set();
      
      Object.values(inventoryData).forEach(item => {
        item.locations.forEach(loc => {
          allLocations.add(JSON.stringify({
            id: loc.id,
            name: loc.name,
            supplier: item.supplier
          }));
        });
      });
      
      const locationsList = Array.from(allLocations).map(locString => JSON.parse(locString));
      
      setLiveLocationInfo(prev => ({
        ...prev,
        locations: locationsList
      }));
    } catch (error) {
      console.error("Error checking inventory:", error);
    } finally {
      setIsCheckingInventory(false);
    }
  }, [materials, liveLocationInfo.zipCode, liveInventoryData, supplierApiStatus]);

  // Load material database
  useEffect(() => {
    const loadMaterialDatabase = async () => {
      setIsLoadingMaterials(true);
      
      try {
        // In a real app, this would fetch from an API
        // For this demo, use mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        const abcSupplyMaterials = [
          { id: 1, name: '1/2" Drywall', unit: 'sheet', price: 12.58, sku: 'ABC-DW-12', supplier: 'ABC Supply', category: 'Drywall' },
          { id: 2, name: '5/8" Drywall - Fire Rated', unit: 'sheet', price: 15.25, sku: 'ABC-DW-58FR', supplier: 'ABC Supply', category: 'Drywall' },
          { id: 3, name: 'Drywall Joint Compound', unit: 'bucket', price: 18.99, sku: 'ABC-DJC-5GL', supplier: 'ABC Supply', category: 'Drywall' },
          { id: 4, name: 'GAF Timberline HDZ Shingles', unit: 'bundle', price: 38.25, sku: 'ABC-RF-THDZ', supplier: 'ABC Supply', category: 'Roofing' },
          { id: 5, name: 'GAF Timberline HDZ Shingles - Black', unit: 'bundle', price: 38.75, sku: 'ABC-RF-THDZ-BLK', supplier: 'ABC Supply', category: 'Roofing' },
          { id: 6, name: 'Vinyl Siding - White', unit: 'square', price: 115.75, sku: 'ABC-SD-VNLW', supplier: 'ABC Supply', category: 'Siding' },
          { id: 7, name: 'R-19 Insulation', unit: 'roll', price: 49.88, sku: 'ABC-INS-R19', supplier: 'ABC Supply', category: 'Insulation' },
          { id: 8, name: 'Primed Interior Trim', unit: 'linear ft', price: 1.25, sku: 'ABC-TR-PIT', supplier: 'ABC Supply', category: 'Trim' },
        ];
        
        const beaconMaterials = [
          { id: 9, name: 'Owens Corning Duration Shingles', unit: 'bundle', price: 35.75, sku: 'BCN-1002', supplier: 'Beacon Roofing', category: 'Roofing' },
          { id: 10, name: 'Synthetic Underlayment', unit: 'roll', price: 85.99, sku: 'BCN-2001', supplier: 'Beacon Roofing', category: 'Roofing' },
          { id: 11, name: 'Ridge Vent', unit: 'linear ft', price: 4.25, sku: 'BCN-3001', supplier: 'Beacon Roofing', category: 'Roofing' },
          { id: 12, name: 'Roof Flashing', unit: 'piece', price: 8.50, sku: 'BCN-4001', supplier: 'Beacon Roofing', category: 'Roofing' },
          { id: 13, name: 'Ice & Water Shield', unit: 'roll', price: 72.99, sku: 'BCN-2002', supplier: 'Beacon Roofing', category: 'Roofing' },
        ];
        
        setMaterialDatabase([...abcSupplyMaterials, ...beaconMaterials]);
        setIsLoadingMaterials(false);
      } catch (error) {
        console.error('Error loading material database:', error);
        setIsLoadingMaterials(false);
      }
    };
    
    loadMaterialDatabase();
  }, []);

  // Add new labor entry
  const addLabor = () => {
    const newId = labor.length > 0 ? Math.max(...labor.map(item => item.id)) + 1 : 1;
    setLabor([...labor, { id: newId, description: '', hours: 0, rate: 50, total: 0 }]);
  };

  // Handle plan upload
  const handlePlanUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPlans = files.map(file => ({
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        file: file
      }));
      
      setUploadedPlans([...uploadedPlans, ...newPlans]);
      if (!selectedPlan) {
        setSelectedPlan(newPlans[0]);
      }
    }
  };

  // Update room
  const updateRoom = (id, field, value) => {
    setRooms(rooms.map(room => 
      room.id === id ? { ...room, [field]: field === 'name' ? value : parseFloat(value) || 0 } : room
    ));
  };

  // Update material
  const updateMaterial = (id, field, value) => {
    setMaterials(materials.map(material => {
      if (material.id === id) {
        const updatedMaterial = { 
          ...material, 
          [field]: field === 'name' || field === 'unit' || field === 'supplier' ? value : parseFloat(value) || 0 
        };
        updatedMaterial.total = updatedMaterial.unitCost * updatedMaterial.quantity;
        return updatedMaterial;
      }
      return material;
    }));
  };

  // Update labor
  const updateLabor = (id, field, value) => {
    setLabor(labor.map(item => {
      if (item.id === id) {
        const updatedItem = { 
          ...item, 
          [field]: field === 'description' ? value : parseFloat(value) || 0 
        };
        updatedItem.total = updatedItem.hours * updatedItem.rate;
        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate room area
  const calculateRoomArea = (room) => {
    return room.length * room.width;
  };

  // Calculate room wall area
  const calculateWallArea = (room) => {
    return 2 * (room.length + room.width) * room.height;
  };

  // Auto-calculate materials based on room dimensions
  const autoCalculate = () => {
    // Find drywall and flooring materials
    const drywallIndex = materials.findIndex(m => m.name.toLowerCase().includes('drywall'));
    const flooringIndex = materials.findIndex(m => m.name.toLowerCase().includes('flooring'));
    const paintIndex = materials.findIndex(m => m.name.toLowerCase().includes('paint'));
    
    if (drywallIndex >= 0 || flooringIndex >= 0 || paintIndex >= 0) {
      const updatedMaterials = [...materials];
      
      // Calculate total room areas
      const totalFloorArea = rooms.reduce((sum, room) => sum + calculateRoomArea(room), 0);
      const totalWallArea = rooms.reduce((sum, room) => sum + calculateWallArea(room), 0);
      
      // Update drywall quantity based on wall area
      if (drywallIndex >= 0) {
        updatedMaterials[drywallIndex].quantity = totalWallArea;
        updatedMaterials[drywallIndex].total = 
          updatedMaterials[drywallIndex].quantity * updatedMaterials[drywallIndex].unitCost;
      }
      
      // Update flooring quantity based on floor area
      if (flooringIndex >= 0) {
        updatedMaterials[flooringIndex].quantity = totalFloorArea;
        updatedMaterials[flooringIndex].total = 
          updatedMaterials[flooringIndex].quantity * updatedMaterials[flooringIndex].unitCost;
      }
      
      // Update paint quantity based on wall area (1 gallon covers ~400 sqft)
      if (paintIndex >= 0) {
        updatedMaterials[paintIndex].quantity = Math.ceil(totalWallArea / 400);
        updatedMaterials[paintIndex].total = 
          updatedMaterials[paintIndex].quantity * updatedMaterials[paintIndex].unitCost;
      }
      
      setMaterials(updatedMaterials);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const materialTotal = materials.reduce((sum, material) => sum + material.total, 0);
    const laborTotal = labor.reduce((sum, item) => sum + item.total, 0);
    return {
      materialTotal,
      laborTotal,
      subtotal: materialTotal + laborTotal,
      tax: (materialTotal + laborTotal) * 0.08, // Assuming 8% tax
      total: (materialTotal + laborTotal) * 1.08
    };
  };

  // Try to auto-connect to APIs on component mount
  useEffect(() => {
    connectToAbcSupply();
    connectToBeaconRoofing();
  }, [connectToAbcSupply, connectToBeaconRoofing]);
  
  // Filter materials database by supplier and search term
  const filteredMaterials = materialDatabase.filter(item => {
    return (selectedSupplier === 'All' || item.supplier === selectedSupplier) && 
           (searchTerm === '' || 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Calculate grand totals
  const totals = calculateTotals();

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Remodeling Takeoff & Estimating</h1>
      
      {/* Plan Upload Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Plans & Blueprints</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
              onClick={() => fileInputRef.current.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2">Click to upload plans<br/>or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">Supports PDF, JPG, PNG</p>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png" 
                ref={fileInputRef}
                onChange={handlePlanUpload}
                multiple
              />
            </div>
            
            {uploadedPlans.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Uploaded Plans</h3>
                <ul className="max-h-40 overflow-y-auto">
                  {uploadedPlans.map(plan => (
                    <li 
                      key={plan.id} 
                      className={`p-2 cursor-pointer rounded ${selectedPlan?.id === plan.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-center">
                        <span className="flex-grow truncate">{plan.name}</span>
                        <span className="text-xs text-gray-500">
                          {(plan.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-2/3 bg-gray-100 rounded-lg flex items-center justify-center min-h-64">
            {selectedPlan ? (
              <div className="w-full p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="font-medium">Preview: {selectedPlan.name}</div>
                  <div className="text-sm text-gray-600">{(selectedPlan.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>

                <div className="w-full h-96 bg-white rounded overflow-hidden flex items-center justify-center">
                  {selectedPlan.type === 'application/pdf' ? (
                    <iframe
                      title={selectedPlan.name}
                      src={selectedPlan.url}
                      className="w-full h-full"
                    />
                  ) : (
                    <img
                      src={selectedPlan.url}
                      alt={selectedPlan.name}
                      className="object-contain w-full h-full"
                    />
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => {
                      setUploadedPlans(uploadedPlans.filter(p => p.id !== selectedPlan.id));
                      setSelectedPlan(null);
                    }}
                  >
                    Remove
                  </button>

                  <button
                    className="px-3 py-1 bg-gray-200 rounded"
                    onClick={() => window.open(selectedPlan.url, '_blank')}
                  >
                    Open
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">No plan selected</div>
            )}
          </div>

        </div>

        <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Estimate Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">Materials:</div>
            <div className="text-right font-medium">${totals.materialTotal.toFixed(2)}</div>
            <div className="text-gray-600">Labor:</div>
            <div className="text-right font-medium">${totals.laborTotal.toFixed(2)}</div>
            <div className="text-gray-600">Tax (8%):</div>
            <div className="text-right">${totals.tax.toFixed(2)}</div>
            <div className="text-gray-600">Total:</div>
            <div className="text-right font-bold">${totals.total.toFixed(2)}</div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={autoCalculate}>Auto Calculate</button>
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={updateWithLiveData}>Update with Live Data</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RemodelingEstimator;