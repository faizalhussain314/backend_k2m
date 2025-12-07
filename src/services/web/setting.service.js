const  Settings  = require('../../models/setting.model');
require('dotenv').config();
const baseUrl = process.env.BASE_URL;

/**
 * Create or update setting
 * @param {string} name
 * @param {string} value
 * @returns {Promise<Settings>}
 */
const createOrUpdateSetting = async (name, value) => {
  const setting = await Settings.findOneAndUpdate(
    { name },
    {
      name,
      value,
      status: true,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );

  return setting;
};

const updateImageSettings = async (type, data) => {
  const results = [];
  for (let i = 1; i <= 3; i++) {
    const key = `${type}_${i}`;
    let value = data[key] || '';

    // Remove baseUrl if present
    if (value.startsWith(baseUrl)) {
      value = value.replace(baseUrl, '').replace(/^\/+/, '');
    }

    const setting = await createOrUpdateSetting(key, value);
    results.push(setting);
  }
  return results;
};

/**
 * Get image settings
 * @param {Object} filter
 * @returns {Promise<Array>}
 */
const getImageSettings = async (filter = {}) => {
  const query = {};
  
  if (filter.type === 'banner') {
    query.name = { $regex: '^banner_', $options: 'i' };
  } else if (filter.type === 'poster') {
    query.name = { $regex: '^poster_', $options: 'i' };
  } else {
    // Get both banner and poster images
    query.name = { $regex: '^(banner_|poster_)', $options: 'i' };
  }
  
  const settings = await Settings.find(query).sort({ name: 1 });
  return settings;
};

const getBannerImages = async () => {
  const banners = await Settings.find({ name: { $regex: '^banner_', $options: 'i' } });
  const result = {};
  banners.forEach(banner => {
    const relativePath = banner.value.replace(/\\/g, '/');
    result[banner.name] = relativePath ? `${baseUrl}/${relativePath}` : '';
  });
  return result;
};

const getPosterImages = async () => {
  const posters = await Settings.find({ name: { $regex: '^poster_', $options: 'i' } });
  const result = {};
  posters.forEach(poster => {
    const relativePath = poster.value.replace(/\\/g, '/');
    result[poster.name] = relativePath ? `${baseUrl}/${relativePath}` : '';
  });
  return result;
};



module.exports = {
  createOrUpdateSetting,
  getImageSettings,
  getBannerImages,
  getPosterImages,
  updateImageSettings

};
