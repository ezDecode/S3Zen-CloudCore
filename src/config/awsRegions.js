/**
 * AWS Regions Configuration
 * Complete list of all AWS regions organized by geography
 * Default region: Stockholm (eu-north-1)
 */

// All AWS regions with country flags and geographic grouping
export const AWS_REGIONS = [
    // 🌍 EUROPE
    { value: 'eu-north-1', label: '🇸🇪 Europe (Stockholm)', group: 'Europe', city: 'Stockholm', country: 'Sweden' },
    { value: 'eu-west-1', label: '🇮🇪 Europe (Ireland)', group: 'Europe', city: 'Dublin', country: 'Ireland' },
    { value: 'eu-west-2', label: '🇬🇧 Europe (London)', group: 'Europe', city: 'London', country: 'United Kingdom' },
    { value: 'eu-west-3', label: '🇫🇷 Europe (Paris)', group: 'Europe', city: 'Paris', country: 'France' },
    { value: 'eu-central-1', label: '🇩🇪 Europe (Frankfurt)', group: 'Europe', city: 'Frankfurt', country: 'Germany' },
    { value: 'eu-central-2', label: '🇨🇭 Europe (Zurich)', group: 'Europe', city: 'Zurich', country: 'Switzerland' },
    { value: 'eu-south-1', label: '🇮🇹 Europe (Milan)', group: 'Europe', city: 'Milan', country: 'Italy' },
    { value: 'eu-south-2', label: '🇪🇸 Europe (Spain)', group: 'Europe', city: 'Aragon', country: 'Spain' },

    // 🌎 AMERICAS
    { value: 'us-east-1', label: '🇺🇸 US East (N. Virginia)', group: 'Americas', city: 'Ashburn', country: 'United States' },
    { value: 'us-east-2', label: '🇺🇸 US East (Ohio)', group: 'Americas', city: 'Columbus', country: 'United States' },
    { value: 'us-west-1', label: '🇺🇸 US West (N. California)', group: 'Americas', city: 'San Francisco', country: 'United States' },
    { value: 'us-west-2', label: '🇺🇸 US West (Oregon)', group: 'Americas', city: 'Portland', country: 'United States' },
    { value: 'ca-central-1', label: '🇨🇦 Canada (Central)', group: 'Americas', city: 'Montreal', country: 'Canada' },
    { value: 'ca-west-1', label: '🇨🇦 Canada (Calgary)', group: 'Americas', city: 'Calgary', country: 'Canada' },
    { value: 'sa-east-1', label: '🇧🇷 South America (São Paulo)', group: 'Americas', city: 'São Paulo', country: 'Brazil' },

    // 🌏 ASIA PACIFIC
    { value: 'ap-south-1', label: '🇮🇳 Asia Pacific (Mumbai)', group: 'Asia Pacific', city: 'Mumbai', country: 'India' },
    { value: 'ap-south-2', label: '🇮🇳 Asia Pacific (Hyderabad)', group: 'Asia Pacific', city: 'Hyderabad', country: 'India' },
    { value: 'ap-southeast-1', label: '🇸🇬 Asia Pacific (Singapore)', group: 'Asia Pacific', city: 'Singapore', country: 'Singapore' },
    { value: 'ap-southeast-2', label: '🇦🇺 Asia Pacific (Sydney)', group: 'Asia Pacific', city: 'Sydney', country: 'Australia' },
    { value: 'ap-southeast-3', label: '🇮🇩 Asia Pacific (Jakarta)', group: 'Asia Pacific', city: 'Jakarta', country: 'Indonesia' },
    { value: 'ap-southeast-4', label: '🇦🇺 Asia Pacific (Melbourne)', group: 'Asia Pacific', city: 'Melbourne', country: 'Australia' },
    { value: 'ap-southeast-5', label: '🇳🇿 Asia Pacific (Auckland)', group: 'Asia Pacific', city: 'Auckland', country: 'New Zealand' },
    { value: 'ap-northeast-1', label: '🇯🇵 Asia Pacific (Tokyo)', group: 'Asia Pacific', city: 'Tokyo', country: 'Japan' },
    { value: 'ap-northeast-2', label: '🇰🇷 Asia Pacific (Seoul)', group: 'Asia Pacific', city: 'Seoul', country: 'South Korea' },
    { value: 'ap-northeast-3', label: '🇯🇵 Asia Pacific (Osaka)', group: 'Asia Pacific', city: 'Osaka', country: 'Japan' },
    { value: 'ap-east-1', label: '🇭🇰 Asia Pacific (Hong Kong)', group: 'Asia Pacific', city: 'Hong Kong', country: 'China' },

    // 🌍 MIDDLE EAST & AFRICA
    { value: 'me-south-1', label: '🇧🇭 Middle East (Bahrain)', group: 'Middle East & Africa', city: 'Manama', country: 'Bahrain' },
    { value: 'me-central-1', label: '🇦🇪 Middle East (UAE)', group: 'Middle East & Africa', city: 'Dubai', country: 'United Arab Emirates' },
    { value: 'il-central-1', label: '🇮🇱 Israel (Tel Aviv)', group: 'Middle East & Africa', city: 'Tel Aviv', country: 'Israel' },
    { value: 'af-south-1', label: '🇿🇦 Africa (Cape Town)', group: 'Middle East & Africa', city: 'Cape Town', country: 'South Africa' },
];

// Default region
export const DEFAULT_REGION = 'eu-north-1';

// Get region groups
export const REGION_GROUPS = ['Europe', 'Americas', 'Asia Pacific', 'Middle East & Africa'];

// Get regions by group
export const getRegionsByGroup = (group) => {
    return AWS_REGIONS.filter(r => r.group === group);
};

// Get region by value
export const getRegionByValue = (value) => {
    return AWS_REGIONS.find(r => r.value === value);
};

// Get region label by value
export const getRegionLabel = (value) => {
    const region = getRegionByValue(value);
    return region ? region.label : value;
};

// Get all region values
export const getAllRegionValues = () => {
    return AWS_REGIONS.map(r => r.value);
};

// Check if a value is a valid region
export const isValidRegionValue = (value) => {
    return AWS_REGIONS.some(r => r.value === value);
};

// Region statistics
export const REGION_STATS = {
    total: AWS_REGIONS.length,
    europe: AWS_REGIONS.filter(r => r.group === 'Europe').length,
    americas: AWS_REGIONS.filter(r => r.group === 'Americas').length,
    asiaPacific: AWS_REGIONS.filter(r => r.group === 'Asia Pacific').length,
    middleEastAfrica: AWS_REGIONS.filter(r => r.group === 'Middle East & Africa').length,
};

export default AWS_REGIONS;
