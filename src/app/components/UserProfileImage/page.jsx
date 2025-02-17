import Image from "next/image";

const UserProfileImage = ({ imageUrl }) => (
  imageUrl ? <Image src={imageUrl} width={40} height={40} alt="User Profile" /> : null
);

export default UserProfileImage;
