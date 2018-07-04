using System;
using System.Text;
using System.Text.RegularExpressions;
using Gmg.Emulator.Enums;

namespace Gmg.Emulator.Helpers
{
    public static class Extensions
    {
        public static string ToWords(this string input) => Regex.Replace(input, "(\\B[A-Z])", " $1");


        public static T[] Set<T>(this T[] self, int index, params T[] values)
        {
            Array.Copy(values, 0, self, index, values.Length);
            return self;
        }

        public static byte[] ToBytes(this string input) => Encoding.ASCII.GetBytes(input);
        public static byte[] ToBytes(this ushort input) => BitConverter.GetBytes(input);
        public static byte[] ToBytes(this WarnCode input) => ((ushort) input).ToBytes();
        public static byte[] ToBytes(this FireState input) => ((ushort) input).ToBytes();
        public static byte[] ToBytes(this GrillState input) => ((ushort) input).ToBytes();
    }
}