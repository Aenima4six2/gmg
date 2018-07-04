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


        public static T[] Fill<T>(this T[] self, int index, T value, int length)
        {
            var filler = new T[length];
            for (var i = 0; i < length; i++) filler[i] = value;
            return self.Set(index, filler);
        }

        public static byte[] ToBytes(this string input) => Encoding.ASCII.GetBytes(input);

        public static byte[] Initialize(this byte[] array, byte value)
        {
            for (var i = 0; i < array.Length; i++)
            {
                array[i] = value;
            }

            return array;
        }
    }
}