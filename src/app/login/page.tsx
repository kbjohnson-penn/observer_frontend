// "use client";

// import React, { useState } from "react";
// import { Input, Stack, Text, Box, Card } from "@chakra-ui/react";
// import { Field } from "@/components/ui/field";
// import { Button } from "@/components/ui/button";
// import { PasswordInput } from "@/components/ui/password-input";
// import { useAuth } from "../../contexts/AuthContext";
// import { useRouter } from "next/navigation";

// const LoginPage = () => {
//   const { login } = useAuth();
//   const router = useRouter(); // Use Next.js router for navigation
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setError(null);
//       await login(username, password);
//       window.location.href = "/dashboard"; // Redirect after login
//     } catch {
//       setError("Invalid username or password.");
//     }
//   };

//   const handleCancel = () => {
//     setUsername("");
//     setPassword("");
//     setError(null);
//     router.push("/"); // Redirect to the homepage or any desired page
//   };

//   return (
//     <Box
//       minH="100vh"
//       display="flex"
//       justifyContent="center"
//       alignItems="center"
//       bg="gray.100"
//       px={4}
//     >
//       <Card.Root
//         maxW="sm"
//         w="full"
//         rounded="md"
//         shadow="lg"
//         bg="white"
//         border="1px"
//       >
//         <Card.Header
//           bg="brand.penn-dark-blue"
//           color="white"
//           roundedTop="md"
//           p={4}
//           mb={4}
//         >
//           <Text fontSize="2xl" fontWeight="bold" textAlign="center">
//             Login
//           </Text>
//           <Text fontSize="sm" textAlign="center" mt={1}>
//             Enter your details to log in
//           </Text>
//         </Card.Header>

//         <Card.Body>
//           <Stack gap={4}>
//             {error && (
//               <Text color="red.500" fontSize="sm" textAlign="center">
//                 {error}
//               </Text>
//             )}

//             <Field label="Username" color="gray.600">
//               <Input
//                 placeholder="Enter your username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 bg="gray.50"
//                 borderColor="gray.300"
//                 _focus={{
//                   borderColor: "blue.500",
//                   bg: "white",
//                 }}
//                 p={4}
//               />
//             </Field>

//             <Field label="Password" color="gray.600">
//               <PasswordInput
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 bg="gray.50"
//                 borderColor="gray.300"
//                 _focus={{
//                   borderColor: "blue.500",
//                   bg: "white",
//                 }}
//                 p={4}
//               />
//             </Field>
//           </Stack>
//         </Card.Body>

//         <Card.Footer justifyContent="flex-end" display="flex" gap={2}>
//           <Button
//             size="lg"
//             variant="outline"
//             colorScheme="gray"
//             p={2}
//             onClick={handleCancel}
//             color="gray.600"
//           >
//             Cancel
//           </Button>
//           <Button
//             size="lg"
//             variant="solid"
//             colorPalette="blue"
//             p={2}
//             onClick={handleSubmit}
//             color="gray.600"
//           >
//             Sign in
//           </Button>
//         </Card.Footer>
//       </Card.Root>
//     </Box>
//   );
// };

// export default LoginPage;

"use client";

import React, { useState } from "react";
import { Input, Stack, Text, Box, Card } from "@chakra-ui/react";

const LoginPage = () => {
  return (
    <Box
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="gray.100"
      px={4}
    >
      <Card.Root
        maxW="sm"
        w="full"
        rounded="md"
        shadow="lg"
        bg="white"
        border="1px"
      >
        <Box
          bg="yellow.100"
          p={3}
          mb={4}
          borderRadius="md"
          border="1px"
          borderColor="yellow.300"
        >
          <Text fontWeight="bold" color="yellow.800" textAlign="center">
            🚧 Page Under Construction 🚧
          </Text>
          <Text fontSize="sm" color="yellow.800" textAlign="center">
            This feature is currently being developed and is not yet available.
          </Text>
        </Box>
      </Card.Root>
    </Box>
  );
};

export default LoginPage;
