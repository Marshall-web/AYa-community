import akyekeTilapia from "@/assets/images/akyeke-and-tilapia.webp";
import akyekeChicken from "@/assets/images/Akyeke-and-chicken.jpg";
import assortedFriedRice from "@/assets/images/Assorted-Fried-Rice.jpg";
import assortedJollof from "@/assets/images/Assorted-jollof.webp";
import bankuGSoup from "@/assets/images/banku-and-g-soup.jpg";
import bankuTilapia from "@/assets/images/Banku-and-Tilapia.jpg";
import chickenOnly from "@/assets/images/Chicken-only.jpg";
import chickenPieces from "@/assets/images/Chicken-pieces.webp";
import fufu from "@/assets/images/FUFU-only.webp";
import fufuGSoup from "@/assets/images/fufu-and-g-soup.webp";
import fufuGoatSoup from "@/assets/images/fufu-and-goat-soup.webp";
import jollofTilapia from "@/assets/images/JOLLOF-TILAPIA.webp";
import yamPalava from "@/assets/images/yam-and-palava-sauce.jpg";
import yamChips from "@/assets/images/Yam-Chips.jpg";
import yamChipsChickenWebp from "@/assets/images/Yam-chips-and-chicken.webp";
import bankuGoatSoup from "@/assets/images/banku-and-goat-soup.webp";
import bankuOkro from "@/assets/images/banku-and-okro.jpg";
import jollof from "@/assets/images/Jollof.jpg";
import omotuoGSoup from "@/assets/images/omotuo-and-g-soup.webp";
import TilapiaOnly from "@/assets/images/tilapia-only.webp";
import FufuTilapia from "@/assets/images/fufu-and-tilapia.jpg";
import friedRiceTilapia from "@/assets/images/fried-rice-and-grilled-tilapia.jpg";
import plainRicePalava from "@/assets/images/plain-rice-and-palava-sauce.jpg";
import plainRiceGSoup from "@/assets/images/plain-rice-and-g-soup.jpg";

// New imports
import bankuChicken from "@/assets/images/banku-and-chicken.jpg";
import bankuFishSoup from "@/assets/images/banku-and-fish-soup.jpg";
import bankuTilapiaSoup from "@/assets/images/banku-and-tilapia-soup.jpg";
import friedRiceChicken from "@/assets/images/Fried-rice-and-chicken.webp";
import goatSoupOnly from "@/assets/images/Goat-soup-only.jpg";
import yamTilapia from "@/assets/images/Yam-and-tilapia.jpg";
import plainRiceChicken from "@/assets/images/plain-Rice-and-Chicken.jpg";
import plainRiceTilapiaNew from "@/assets/images/plain-rice-and-tilapia.webp";
import fufuFishSoup from "@/assets/images/fufu-and-fish-soup.webp";
import saladImg from "@/assets/images/salad.jpg";

// Starter/Soup Only imports
import fishSoupOnly from "@/assets/images/Fish-soup-only.jpg";
import tilapiaSoupOnly from "@/assets/images/Tilapia-soup-only.jpg";
import groundnutSoupOnly from "@/assets/images/groundnut-soup-only.jpg";
import okroSoupOnly from "@/assets/images/okro-soup-only.webp";
import palavaSauceOnly from "@/assets/images/palava-sauce-only.jpg";
import jollofOnly from "@/assets/images/jollof-only.webp";

// Specific Soup Combination imports
import akyekeGoatSoupNew from "@/assets/images/Akyeke-and-goat-soup.jpg";
import akyekeFishSoupNew from "@/assets/images/akyeke-and-fish-soup.jpg";
import akyekeTilapiaSoupNew from "@/assets/images/Akyeke-and-tilapia-soup.jpg";
import plainRiceGoatSoupNew from "@/assets/images/plain-rice-and-goat-soup.jpg";
import plainRiceFishSoupNew from "@/assets/images/Plain-rice-and-fish-soup.jpg";
import plainRiceTilapiaSoupNew from "@/assets/images/plain-rice-and-tilapia-soup.jpg";




export const menuImages: Record<string, string> = {
    // Basic items
    "akyeke": akyekeTilapia,
    "banku": bankuTilapia,
    "fufu": fufu,
    "jollof": jollof,
    "friedrice": assortedFriedRice,
    "plainrice": plainRiceGSoup,
    "yam": yamPalava,
    "omotuo": omotuoGSoup,
    "tilapia": TilapiaOnly,
    "chicken": chickenOnly,
    "salad": saladImg,

    // Mixed dishes (Normalization will strip 'and'/'with')
    "akyeketilapia": akyekeTilapia,
    "akyekechicken": akyekeChicken,
    "bankutilapia": bankuTilapia,
    "bankuchicken": bankuChicken,
    "fufutilapia": FufuTilapia,
    "jolloftilapia": jollofTilapia,
    "jollofchicken": jollof,
    "friedricetilapia": friedRiceTilapia,
    "friedricechicken": friedRiceChicken,
    "plainricetilapia": plainRiceTilapiaNew,
    "plainricechicken": plainRiceChicken,
    "yamtilapia": yamTilapia,
    "yampalava": yamPalava,
    "plainricepalava": plainRicePalava,

    // Soup variations (Must contain 'soup' in name)
    "bankutilapiasoup": bankuTilapiaSoup,
    "fufutilapiasoup": FufuTilapia,
    "fufugoatsoup": fufuGoatSoup,
    "fufufishsoup": fufuFishSoup,
    "fufugnutsoup": fufuGSoup,
    "bankugoatsoup": bankuGoatSoup,
    "bankufishsoup": bankuFishSoup,
    "bankugnutsoup": bankuGSoup,
    "akyekegoatsoup": akyekeGoatSoupNew,
    "akyekefishsoup": akyekeFishSoupNew,
    "akyeketilapiasoup": akyekeTilapiaSoupNew,
    "plainricegoatsoup": plainRiceGoatSoupNew,
    "plainricefishsoup": plainRiceFishSoupNew,
    "plainricetilapiasoup": plainRiceTilapiaSoupNew,
    "plainricegnutsoup": plainRiceGSoup,

    "omotuognutsoup": omotuoGSoup,
    "ricegnut": plainRiceGSoup,
    "ricepalava": plainRicePalava,

    // Exact matches for common variations
    "AssortedFriedRice": assortedFriedRice,
    "AssortedJollof": assortedJollof,
    "BankuOkro": bankuOkro,
    "ChickenPieces": chickenPieces,
    "GoatSoupOnly": goatSoupOnly,
    "FishSoupOnly": fishSoupOnly,
    "TilapiaSoupOnly": tilapiaSoupOnly,
    "GroundNutSoupOnly": groundnutSoupOnly,
    "OkroSoupOnly": okroSoupOnly,
    "PalavaSauceOnly": palavaSauceOnly,

    // Normalized variations
    "goatsouponly": goatSoupOnly,
    "fishsouponly": fishSoupOnly,
    "tilapiasouponly": tilapiaSoupOnly,
    "groundnutsouponly": groundnutSoupOnly,
    "okrosouponly": okroSoupOnly,
    "palavasauceonly": palavaSauceOnly,
    "jollofonly": jollofOnly,
    "friedriceonly": assortedFriedRice,
    "akyekeonly": akyekeTilapia,
    "bankuonly": bankuTilapia,
    "fufuonly": fufu,
    "extrapack": chickenPieces,
};


