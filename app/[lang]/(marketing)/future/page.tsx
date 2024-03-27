import { CouncilList } from '@/components/council-list'

export default function CouncilPage() {
  return (
    <CouncilList
      title="Elected Transitional Council"
      description=" We’re a dynamic group of individuals who are passionate about what we do and dedicated to delivering the best results for our clients."
      data={new_details}
    />
  )
}

//TODO: move to a better place
const old_details = [
  {
    name: 'Edgard Leblanc Fils',
    representation: 'Collective of January 30',
    politicalLeaning: 'Moderate/Center-left',
    biases: 'Likely biased towards policies promoting social justice and economic equality',
    liability:
      'Association with a specific political party might limit appeal across broader political spectrum',
    credibility: 'History of public service as a former senator',
    trustworthiness: 'Depends on public perception, which can vary',
  },
  {
    name: 'Fritz Alphonse Jean',
    representation: 'Montana Agreement',
    politicalLeaning: 'Progressive/Left',
    biases: 'May favor policies aimed at reducing economic disparities',
    liability:
      'Economic views might clash with more conservative or business-oriented council members',
    credibility:
      'Experience in economic policy as former Governor of the Bank of the Republic of Haiti',
    trustworthiness: 'Professional background suggests reliability',
  },
  {
    name: 'Louis Gérald Gilles',
    representation: 'Agreement of December 21, 2022',
    politicalLeaning: 'Left-wing',
    biases: 'Likely supports pro-people policies, social programs',
    liability: 'Allegiance to Fanmi Lavalas might be seen as a limitation',
    credibility: 'Experience in legislative processes as a former senator',
    trustworthiness: 'Affiliation provides a substantial public record',
  },
  {
    name: 'Marie Ghislaine Mompremier',
    representation: 'EDE/RED and Political Commitment and Allies',
    politicalLeaning: 'Progressive',
    biases: 'May prioritize gender equality and social justice issues',
    liability: 'Specific focus on gender may not align with all council priorities',
    credibility: 'Expertise in social policy as former Minister for the Status of Women',
    trustworthiness: 'Advocacy work lends her a positive image',
  },
  {
    name: 'Leslie Voltaire',
    representation: 'Fanmi Lavalas',
    politicalLeaning: 'Left-wing',
    biases: 'Focused on social equity, may push for redistributive policies',
    liability: 'Polarizing history in Haitian politics',
    credibility: 'Involved in political activism and development projects',
    trustworthiness: 'Long-standing involvement in social causes',
  },
  {
    name: 'Laurent St Cyr',
    representation: 'Private Business Sector',
    politicalLeaning: 'Right-wing/Conservative',
    biases: 'Likely biased towards market-friendly policies and economic liberalization',
    liability: 'Interests may conflict with more progressive council members',
    credibility: 'Authority on economic matters through business leadership positions',
    trustworthiness: 'Integrity in business dealings can enhance reputation',
  },
]

const new_details = [
  {
    name: 'Edgard Leblanc Fils',
    photo:
      'https://faithinactioninternational.org/wp-content/uploads/2021/11/Edgar_Leblanc_haiti.png',
    representation: 'Collective of January 30',
    politicalLeaning: 'Moderate/Center-left',
    concerns: ['Political Alignment & Influence', 'Balancing diverse political interests'],
    background: 'History in the Haitian Senate, member of OPL',
  },
  {
    name: 'Fritz Alphonse Jean',
    photo:
      'https://scontent-hou1-1.xx.fbcdn.net/v/t39.30808-6/244077472_529899878053806_2771619606574573519_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=5f2048&_nc_ohc=9sqgPQAiEosAX8YfJKh&_nc_ht=scontent-hou1-1.xx&oh=00_AfBHO-_JNkBiH7UgU5ijqfoi1fc7V_ujeFoP0fqLD5iw6Q&oe=6603C40A',
    representation: 'Montana Agreement',
    politicalLeaning: 'Progressive/Left',
    concerns: ['Economic Policies', 'Favoring certain sectors over others'],
    background: 'Former Governor of the Bank of the Republic of Haiti, Prime Minister-designate',
  },
  {
    name: 'Louis Gérald Gilles',
    photo:
      'https://loopnewslive.blob.core.windows.net/liveimage/sites/default/files/2019-08/x04MD8KGSf.jpg',
    representation: 'Agreement of December 21, 2022',
    politicalLeaning: 'Left-wing',
    concerns: [
      'Party Loyalty vs. National Interest',
      'Serving party interests over national interests',
    ],
    background: 'Ties to Fanmi Lavalas, known for social activism',
  },
  {
    name: 'Marie Ghislaine Mompremier',
    photo:
      'https://i0.wp.com/haitiantimes.com/wp-content/uploads/2022/03/Marie-Ghislaine-Mompremier.jpg?w=720&ssl=1',
    representation: 'EDE/RED and Political Commitment and Allies',
    politicalLeaning: 'Progressive',
    concerns: ['Focus on Specific Issues', 'Alignment with broader council objectives'],
    background: 'Former Minister for the Status of Women, focused on gender issues',
  },
  {
    name: 'Leslie Voltaire',
    photo: 'https://pbs.twimg.com/profile_images/1119290187/_RIC3386_FLAG_cropped_400x400.jpg',
    representation: 'Fanmi Lavalas',
    politicalLeaning: 'Left-wing',
    concerns: ['Party Controversies', 'Ability to unify different political factions'],
    background: 'Urban planner and activist, involved in post-2010 earthquake reconstruction',
  },
  {
    name: 'Laurent St Cyr',
    photo:
      'https://media.licdn.com/dms/image/D4E03AQH03oehoWa0pA/profile-displayphoto-shrink_800_800/0/1705000448587?e=1716422400&v=beta&t=FN_NShsPbejb6b0Due9r7cRM4Dua2VxKeL-mcDw7EQg',
    representation: 'Private Business Sector',
    politicalLeaning: 'Right-wing/Conservative',
    concerns: ['Business Interests', 'Favoring business interests over societal needs'],
    background:
      'Represents business community interests, involved in promoting business as a pathway to recovery',
  },
]
